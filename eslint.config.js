import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    files: [
      "src/**/*.{js,mjs,cjs}",
      "test/**/*.{js,mjs,cjs}",
      "main.{js,mjs,cjs}",
    ],
    plugins: {
      js,
      "@stylistic": stylistic,
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly",
      },
    },
    rules: {
      "@stylistic/semi": ["error", "always"],
      "@stylistic/brace-style": "error",
      "@stylistic/comma-dangle": ["error", "never"],
    },
  },
]);
