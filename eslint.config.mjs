import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Architecture boundaries (see README):
 *   app → modules → platform → shared
 *   a module is only reachable through its public entry points:
 *     @/modules/<name>          (UI screens + data hooks: index.ts)
 *     @/modules/<name>/domain   (pure logic + types: domain/index.ts)
 */
const modulePublicApiOnly = {
  group: ["@/modules/*/*", "!@/modules/*/domain"],
  message: "Import other modules only via '@/modules/<name>' or '@/modules/<name>/domain'.",
};

const testingDbOnlyInTests = {
  group: ["@/platform/db/testing"],
  message: "The Node test database is for *.test.ts files only.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [modulePublicApiOnly, testingDbOnlyInTests] }],
    },
  },
  {
    files: ["src/modules/**"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            modulePublicApiOnly,
            testingDbOnlyInTests,
            { group: ["@/app/*"], message: "Modules must not depend on routes." },
            { group: ["../../*"], message: "Don't reach outside the module with relative paths." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/**/domain/**"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            modulePublicApiOnly,
            {
              group: ["react", "next/*", "@/platform/*", "@tanstack/*", "../*"],
              message: "domain/ is pure logic: no React, Next, database or other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/platform/**"],
    ignores: ["**/*.test.ts", "src/platform/db/testing.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            testingDbOnlyInTests,
            {
              group: ["@/modules/*", "@/modules/**", "@/app/*"],
              message: "platform/ must not depend on features or routes.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*", "@/modules/**", "@/platform/*", "@/app/*"],
              message: "shared/ must stay independent of modules, platform and routes.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sqlite/**",
    "public/db-worker.js",
  ]),
]);

export default eslintConfig;
