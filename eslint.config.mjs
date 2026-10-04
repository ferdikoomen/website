import javascript from '@eslint/js';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import typescript from 'typescript-eslint';

export default [
    {
        ignores: ['dist/*', 'public/*'],
    },
    javascript.configs.recommended,
    ...typescript.configs.recommended,
    prettierConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'prettier/prettier': 'error',
        },
    },
];
