const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DB_NAME = "relay-pulse-db";
const KV_NAME = "RELAY_PULSE_KV";

// --- Auth Check ---
if (!(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID)) {
  console.error("❌ Error: CLOUDFLARE credentials missing.");
  process.exit(1);
}

function run(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      env: process.env,
    }).trim();
  } catch {
    return null;
  }
}

function uploadSecret(key, value) {
  if (!value) {
    console.log(`⚠️  Skipping secret '${key}': Value is empty/missing.`);
    return;
  }
  console.log(`🔐 Uploading secret: ${key}`);
  try {
    execSync(`npx wrangler secret put ${key}`, {
      input: value,
      stdio: ["pipe", "ignore", "ignore"],
      env: process.env,
    });
  } catch {
    console.error(`❌ Failed to upload secret ${key}`);
  }
}

console.log("🚀 Starting Cloudflare Setup...");

let dbId = null;
const d1Json = run("npx wrangler d1 list --json");
if (d1Json) {
  const existing = JSON.parse(d1Json).find((db) => db.name === DB_NAME);
  dbId = existing ? existing.uuid : null;
}
if (!dbId) {
  console.log(`🔧 Creating D1: ${DB_NAME}`);
  run(`npx wrangler d1 create ${DB_NAME}`);
  const newJson = run("npx wrangler d1 list --json");
  dbId = JSON.parse(newJson).find((db) => db.name === DB_NAME).uuid;
}

let kvId = null;
const kvJson = run("npx wrangler kv:namespace list --json");
if (kvJson) {
  const existing = JSON.parse(kvJson).find((kv) => kv.title === KV_NAME);
  kvId = existing ? existing.id : null;
}
if (!kvId) {
  console.log(`🔧 Creating KV: ${KV_NAME}`);
  run(`npx wrangler kv:namespace create ${KV_NAME}`);
  const newJson = run("npx wrangler kv:namespace list --json");
  kvId = JSON.parse(newJson).find((kv) => kv.title === KV_NAME).id;
}

console.log("📝 Writing wrangler.json...");
const template = require("../wrangler.template.json");
if (dbId) {
  template.d1_databases[0].database_id = dbId;
}
if (kvId) {
  template.kv_namespaces[0].id = kvId;
}
fs.writeFileSync(
  path.join(__dirname, "../wrangler.json"),
  JSON.stringify(template, null, 2)
);

console.log("🔑 Configuring Secrets...");

uploadSecret("RELAY_AUTH_EMAIL", process.env.RELAY_AUTH_EMAIL);

uploadSecret("RELAY_AUTH_SECRET", process.env.RELAY_AUTH_SECRET);

let jwtSecret = process.env.RELAY_JWT_SECRET;
if (!jwtSecret) {
  console.log("🎲 Generating new random JWT secret...");
  jwtSecret = crypto.randomBytes(32).toString("base64");
}
uploadSecret("RELAY_JWT_SECRET", jwtSecret);

console.log("✅ Environment Setup Complete!");
