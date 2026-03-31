import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local worktrees and non-source content should not be part of app linting.
    ".worktrees/**",
    ".claude/**",
    "content/**",
    "docs/**",
    "knowledge-docs/**",
    "knowledge-sources/**",
  ]),
]);

export default eslintConfig;
