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
        // Allow intentional omission of deps
        "react-hooks/exhaustive-deps": "warn",
        // setState inside useEffect is valid pattern for reading localStorage/window
        "react-hooks/set-state-in-effect": "off",
        // <img> warnings are non-blocking for external images
        "@next/next/no-img-element": "warn",
    }
}]);
