// @ts-check
/** @type {import("@typescript-eslint/experimental-utils/dist/ts-eslint/Linter").Linter.Config} */
const config = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        // "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        // "plugin:@typescript-eslint/recommended",
        // "plugin:@typescript-eslint/recommended-requiring-type-checking",
        // ".eslintrc_modular/eslintrc",

        ".eslintrc_modular/strict",
        ".eslintrc_modular/recommended",
        ".eslintrc_modular/overridable",
        ".eslintrc_modular/auto_fix",
        ".eslintrc_modular/unsorted",
        // ".eslintrc_modular/noop"
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",
    },
    plugins: ["react", "@typescript-eslint", "react-hooks"],
    rules: {
        "no-restricted-syntax": ["error", "TSTupleType[elementTypes]"],
        // "@typescript-eslint/ban-types": [
        //     "error",
        //     {
        //         extendDefaults: true,
        //         types: {
        //             "never[]":
        //                 "Don't use the empty array type `[]`, it will only allow empty arrays. Use `SomeType[]` instead.",
        //             "[[]]":
        //                 "Don't use `[[]]`, it would only allow an array with a single element which is an empty array. Use `SomeType[][]` instead.",
        //             "[[[]]]": "Don't use `[[[]]]`. Use `SomeType[][][]` instead.",
        //         },
        //     },
        // ],

        // "no-undef": "error",
        // "react/no-unescaped-entities": ["warn", { forbid: [">", "}"] }],
        // "react-hooks/rules-of-hooks": "warn",
        // "react-hooks/exhaustive-deps": "warn",
        // // "indent": ["warn", 4, { "SwitchCase": 1 }],
        // "linebreak-style": ["warn", "unix"],
        // // unused vars is done by typescript, don't need second error.
        // "no-unused-vars": "off",
        // "no-constant-condition": ["warn", { checkLoops: false }],
    },
};
module.exports = config;
