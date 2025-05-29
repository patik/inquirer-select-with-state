import pluginJs from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import { globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default [
    globalIgnores(['**/dist/**', '**/node_modules/**']),
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettier,
]
