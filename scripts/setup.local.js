const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

// --- Configuration ---
const DB_NAME = "relay-pulse-db";
const KV_NAME = "RELAY_PULSE_KV";
const R2_NAME = "relay-pulse-assets";

const ENV_LOCAL_PATH = path.join(__dirname, "../.env.local");
const DEV_VARS_PATH = path.join(__dirname, "../.dev.vars");
const WRANGLER_TEMPLATE = path.join(__dirname, "../wrangler.template.json");
const WRANGLER_OUTPUT = path.join(__dirname, "../wrangler.json");

// --- Utils ---
function run(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      env: process.env, // Inherit vars from .env.local
    }).trim();
  } catch {
    return null;
  }
}

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, "utf8");
  const vars = {};
  for (const line of content.split("\n")) {
    // biome-ignore lint/performance/useTopLevelRegex: no-need
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !line.trim().startsWith("#")) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      vars[key] = value;
    }
  }
  return vars;
}

function main() {
  console.log("\n💻 \x1b[36mRelay Pulse - Local Dev Setup\x1b[0m\n");

  // 1. LOAD .ENV.LOCAL (CRITICAL STEP)
  console.log("1️⃣  \x1b[1mLoading Environment...\x1b[0m");
  const envLocal = parseEnv(ENV_LOCAL_PATH);

  // Inject .env.local into process.env so wrangler uses the Token/Account ID if present
  Object.assign(process.env, envLocal);

  if (envLocal.CLOUDFLARE_API_TOKEN) {
    console.log("   ✅ Detected CLOUDFLARE_API_TOKEN in .env.local");
  } else {
    console.log(
      "   ℹ️  No API Token in .env.local, checking wrangler login status..."
    );
  }

  // 2. CHECK AUTH & RESOURCES
  // const whoami = run("pnpm wrangler whoami");
  // if (!whoami) {
  //   console.error(
  //     "\n   ❌ Error: Not logged in and no valid CLOUDFLARE_API_TOKEN found."
  //   );
  //   console.error(
  //     "   👉 Run \x1b[33mpnpm wrangler login\x1b[0m OR add credentials to .env.local\n"
  //   );
  //   process.exit(1);
  // }

  // --- D1 ---
  let dbId = null;
  const d1List = JSON.parse(run("pnpm wrangler d1 list --json") || "[]");
  const existingDb = d1List.find((d) => d.name === DB_NAME);
  if (existingDb) {
    dbId = existingDb.uuid;
    console.log(`   ✅ D1 Found: ${dbId}`);
  } else {
    console.log(`   🔧 Creating D1 '${DB_NAME}'...`);
    run(`pnpm wrangler d1 create ${DB_NAME}`);
    const newList = JSON.parse(run("pnpm wrangler d1 list --json") || "[]");
    dbId = newList.find((d) => d.name === DB_NAME).uuid;
  }

  // --- KV ---
  let kvId = null;
  const kvList = JSON.parse(run("pnpm wrangler kv namespace list") || "[]");
  const existingKv = kvList.find((d) => d.title === KV_NAME);
  if (existingKv) {
    kvId = existingKv.id;
    console.log(`   ✅ KV Found: ${kvId}`);
  } else {
    console.log(`   🔧 Creating KV '${KV_NAME}'...`);
    run(`pnpm wrangler kv namespace create ${KV_NAME}`);
    const newList = JSON.parse(run("pnpm wrangler kv namespace list") || "[]");
    kvId = newList.find((d) => d.title === KV_NAME).id;
  }

  // --- R2 ---
  const r2List = JSON.parse(run("pnpm wrangler r2 bucket list --json") || "[]");
  if (r2List.some((b) => b.name === R2_NAME)) {
    console.log("   ✅ R2 Found");
  } else {
    console.log(`   🔧 Creating R2 '${R2_NAME}'...`);
    run(`pnpm wrangler r2 bucket create ${R2_NAME}`);
  }

  // 3. GENERATE WRANGLER.JSON
  console.log("\n2️⃣  \x1b[1mGenerating wrangler.json...\x1b[0m");
  try {
    const template = require(WRANGLER_TEMPLATE);
    template.d1_databases[0].database_id = dbId;
    template.kv_namespaces[0].id = kvId;
    fs.writeFileSync(WRANGLER_OUTPUT, JSON.stringify(template, null, 2));
    console.log("   ✅ config updated.");
  } catch {
    console.error("   ❌ Error: wrangler.template.json missing.");
    process.exit(1);
  }

  // 4. GENERATE .DEV.VARS (INTELLIGENT SYNC)
  console.log("\n3️⃣  \x1b[1mConfiguring Local Secrets (.dev.vars)...\x1b[0m");
  const devVarsContent = fs.existsSync(DEV_VARS_PATH)
    ? fs.readFileSync(DEV_VARS_PATH, "utf8")
    : "";
  const handleSecret = (key, fallbackVal, fallbackMsg) => {
    // If already in .dev.vars, skip
    if (devVarsContent.includes(`${key}=`)) {
      console.log(`   ✅ ${key} exists in .dev.vars`);
      return;
    }

    // Check .env.local
    if (envLocal[key]) {
      fs.appendFileSync(DEV_VARS_PATH, `\n${key}=${envLocal[key]}`);
      console.log(`   ✅ Copied ${key} from .env.local`);
      return;
    }

    // Use Fallback
    fs.appendFileSync(DEV_VARS_PATH, `\n${key}=${fallbackVal}`);
    console.log(`   ⚠️  ${key} missing in .env.local.`);
    console.log(`      👉 ${fallbackMsg}: \x1b[33m${fallbackVal}\x1b[0m`);
  };

  // Process RELAY_AUTH_EMAIL
  handleSecret("RELAY_AUTH_EMAIL", "admin@localhost", "Using default email");

  // Process RELAY_AUTH_SECRET
  handleSecret("RELAY_AUTH_SECRET", "dev-secret-123", "Using default password");

  // Process RELAY_JWT_SECRET (Random if missing)
  const randomJwt = crypto.randomBytes(32).toString("base64");
  handleSecret("RELAY_JWT_SECRET", randomJwt, "Generated new secure token");

  // 5. MIGRATE LOCAL DB
  console.log("\n4️⃣  \x1b[1mSeeding Local Database...\x1b[0m");
  try {
    console.log("   Running: npm run db:migrate:local");
    execSync("npm run db:migrate:local", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("   ✅ Local DB ready.");
  } catch {
    console.log("   ❌ Migration failed. Check logs.");
  }

  console.log("\n🎉 \x1b[32mSetup Complete! Run: npm run dev\x1b[0m\n");
}

main();
