import js from "@eslint/js"
import globals from "globals"
import prettier from "eslint-config-prettier"

export default [
  { ignores: ["node_modules/", "coverage/", "samples/", ".scratch/"] },
  js.configs.recommended,
  { files: ["frontend/**/*.js"], languageOptions: { globals: globals.browser } },
  { files: ["scripts/**/*.js"], languageOptions: { globals: globals.node } },
  { files: ["core/tests/**/*.js"], languageOptions: { globals: globals.jest } },
  prettier,
]
