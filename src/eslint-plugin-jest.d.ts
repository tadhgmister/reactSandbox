import { ESLintConfig } from "./eslintConfig";

interface JestPluginRules {
  /**
   * Have control over `test` and `it` usages
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/consistent-test-it.md
   */
  "jest/consistent-test-it": ESLintConfig.RuleOptions<
    [
      {
        fn?: "it" | "test";
        withinDescribe?: "it" | "test";
      }
    ]
  >;
  /**
   * Enforce assertion to be made in a test body
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/expect-expect.md
   */
  "jest/expect-expect": ESLintConfig.RuleOptions<
    [
      {
        assertFunctionNames?: [] | [string];
      }
    ]
  >;
  /**
   * Enforce lowercase test names
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/lowercase-name.md
   */
  "jest/lowercase-name": ESLintConfig.RuleOptions<
    [
      {
        ignore?: ("describe" | "test" | "it")[];
        allowedPrefixes?: string[];
        ignoreTopLevelDescribe?: boolean;
      }
    ]
  >;
  /**
   * Disallow alias methods
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-alias-methods.md
   */
  "jest/no-alias-methods": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow commented out tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-commented-out-tests.md
   */
  "jest/no-commented-out-tests": ESLintConfig.RuleWithoutOptions;
  /**
   * Prevent calling `expect` conditionally
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-conditional-expect.md
   */
  "jest/no-conditional-expect": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow use of deprecated functions
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-deprecated-functions.md
   */
  "jest/no-deprecated-functions": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow disabled tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-disabled-tests.md
   */
  "jest/no-disabled-tests": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow duplicate setup and teardown hooks
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-duplicate-hooks.md
   */
  "jest/no-duplicate-hooks": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow expect.resolves
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-expect-resolves.md
   */
  "jest/no-expect-resolves": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow using `exports` in files containing tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-export.md
   */
  "jest/no-export": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow focused tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-focused-tests.md
   */
  "jest/no-focused-tests": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow setup and teardown hooks
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-hooks.md
   */
  "jest/no-hooks": ESLintConfig.RuleOptions<
    [
      {
        allow?: unknown[];
      }
    ]
  >;
  /**
   * Disallow identical titles
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-identical-title.md
   */
  "jest/no-identical-title": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow conditional logic
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-if.md
   */
  "jest/no-if": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow string interpolation inside snapshots
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-interpolation-in-snapshots.md
   */
  "jest/no-interpolation-in-snapshots": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow Jasmine globals
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-jasmine-globals.md
   */
  "jest/no-jasmine-globals": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow importing Jest
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-jest-import.md
   */
  "jest/no-jest-import": ESLintConfig.RuleWithoutOptions;
  /**
   * disallow large snapshots
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-large-snapshots.md
   */
  "jest/no-large-snapshots": ESLintConfig.RuleOptions<
    [
      {
        maxSize?: number;
        inlineMaxSize?: number;
        allowedSnapshots?: {
          [k: string]: unknown[] | undefined;
        };
        whitelistedSnapshots?: {
          /**
           * This interface was referenced by `undefined`'s JSON-Schema definition
           * via the `patternProperty` ".*".
           */
          [k: string]: unknown[];
        };
      }
    ]
  >;
  /**
   * Disallow manually importing from `__mocks__`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-mocks-import.md
   */
  "jest/no-mocks-import": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow specific matchers & modifiers
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-restricted-matchers.md
   */
  "jest/no-restricted-matchers": ESLintConfig.RuleOptions<
    [
      {
        [k: string]: (string | null) | undefined;
      }
    ]
  >;
  /**
   * Disallow using `expect` outside of `it` or `test` blocks
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-standalone-expect.md
   */
  "jest/no-standalone-expect": ESLintConfig.RuleOptions<
    [
      {
        additionalTestBlockFunctions?: string[];
      }
    ]
  >;
  /**
   * Avoid using a callback in asynchronous tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-test-callback.md
   */
  "jest/no-test-callback": ESLintConfig.RuleWithoutOptions;
  /**
   * Use `.only` and `.skip` over `f` and `x`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-test-prefixes.md
   */
  "jest/no-test-prefixes": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow explicitly returning from tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-test-return-statement.md
   */
  "jest/no-test-return-statement": ESLintConfig.RuleWithoutOptions;
  /**
   * Disallow using `toBeTruthy()` & `toBeFalsy()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-truthy-falsy.md
   */
  "jest/no-truthy-falsy": ESLintConfig.RuleWithoutOptions;
  /**
   * Prefer using toThrow for exception tests
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/no-try-expect.md
   */
  "jest/no-try-expect": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `toBeCalledWith()` or `toHaveBeenCalledWith()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-called-with.md
   */
  "jest/prefer-called-with": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `expect.assertions()` OR `expect.hasAssertions()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-expect-assertions.md
   */
  "jest/prefer-expect-assertions": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest having hooks before any test cases
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-hooks-on-top.md
   */
  "jest/prefer-hooks-on-top": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using inline snapshots
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-inline-snapshots.md
   */
  "jest/prefer-inline-snapshots": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `jest.spyOn()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-spy-on.md
   */
  "jest/prefer-spy-on": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `toStrictEqual()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-strict-equal.md
   */
  "jest/prefer-strict-equal": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `toBeNull()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-to-be-null.md
   */
  "jest/prefer-to-be-null": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `toBeUndefined()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-to-be-undefined.md
   */
  "jest/prefer-to-be-undefined": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `toContain()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-to-contain.md
   */
  "jest/prefer-to-contain": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `toHaveLength()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-to-have-length.md
   */
  "jest/prefer-to-have-length": ESLintConfig.RuleWithoutOptions;
  /**
   * Suggest using `test.todo`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/prefer-todo.md
   */
  "jest/prefer-todo": ESLintConfig.RuleWithoutOptions;
  /**
   * Require a message for `toThrow()`
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/require-to-throw-message.md
   */
  "jest/require-to-throw-message": ESLintConfig.RuleWithoutOptions;
  /**
   * Require test cases and hooks to be inside a `describe` block
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/require-top-level-describe.md
   */
  "jest/require-top-level-describe": ESLintConfig.RuleWithoutOptions;
  /**
   * Enforce valid `describe()` callback
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/valid-describe.md
   */
  "jest/valid-describe": ESLintConfig.RuleWithoutOptions;
  /**
   * Enforce having return statement when testing with promises
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/valid-expect-in-promise.md
   */
  "jest/valid-expect-in-promise": ESLintConfig.RuleWithoutOptions;
  /**
   * Enforce valid `expect()` usage
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/valid-expect.md
   */
  "jest/valid-expect": ESLintConfig.RuleOptions<
    [
      {
        alwaysAwait?: boolean;
        minArgs?: number;
        maxArgs?: number;
      }
    ]
  >;
  /**
   * Enforce valid titles
   * https://github.com/jest-community/eslint-plugin-jest/blob/v23.20.0/docs/rules/valid-title.md
   */
  "jest/valid-title": ESLintConfig.RuleOptions<
    [
      {
        ignoreTypeOfDescribeName?: boolean;
        disallowedWords?: string[];
        mustNotMatch?:
          | string
          | {
              describe?: string;
              test?: string;
              it?: string;
            };
        mustMatch?:
          | string
          | {
              describe?: string;
              test?: string;
              it?: string;
            };
      }
    ]
  >;
}

declare global {
  namespace ESLintConfig {
    interface PluginRules {
      jest: JestPluginRules;
    }
    interface PluginConfigs {
      jest: {
        "plugin:jest/all": true;
        "plugin:jest/recommended": true;
        "plugin:jest/style": true;
      };
    }
  }
}
