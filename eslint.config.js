import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    files: ["**/*.js"],
    plugins: {
      js,
      react,
    },
    extends: ["js/recommended"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
  globalIgnores(["**/.next/"]),
]);
