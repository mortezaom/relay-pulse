import { defineConfig } from "@solidjs/start/config";
import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
    ssr: false,
    vite: {
        resolve: {
            alias: {
                "~": path.resolve(__dirname, "./src")
            }
        }
    }
});
