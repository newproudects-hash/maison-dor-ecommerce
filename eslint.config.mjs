import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...next],
    rules: {
        // French content uses ' extensively — disabling cosmetic rule
        "react/no-unescaped-entities": "off",
        // Disabled to allow intentional omission of deps in some effects
        "react-hooks/exhaustive-deps": "warn",
    }
}]);
