import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The renderer lives in exactly one lazily-loaded chunk. Without this
    // fence the other five screens silently start paying for three.js.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/organisms/process/scene/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["three", "three/*", "@react-three/*", "maath", "maath/*"],
              message:
                "three.js may only be imported from src/components/organisms/process/scene/**. Everything else must go through the ProcessScene contract in src/types/process-scene.ts.",
            },
          ],
        },
      ],
    },
  },
  // api/ is its own package with its own tsconfig; the Next rules do not apply.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "api/**"]),
]);

export default eslintConfig;
