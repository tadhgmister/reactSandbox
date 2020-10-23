import { ESLintConfig } from "./eslintConfig";

interface EslintCommentsPluginRules {
  /**
   * require a `eslint-enable` comment for every `eslint-disable` comment
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html
   */
  "eslint-comments/disable-enable-pair": ESLintConfig.RuleOptions<
    [
      {
        allowWholeFile?: boolean;
      }
    ]
  >;
  /**
   * disallow a `eslint-enable` comment for multiple `eslint-disable` comments
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-aggregating-enable.html
   */
  "eslint-comments/no-aggregating-enable": ESLintConfig.RuleWithoutOptions;
  /**
   * disallow duplicate `eslint-disable` comments
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-duplicate-disable.html
   */
  "eslint-comments/no-duplicate-disable": ESLintConfig.RuleWithoutOptions;
  /**
   * disallow `eslint-disable` comments about specific rules
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-restricted-disable.html
   */
  "eslint-comments/no-restricted-disable": ESLintConfig.RuleOptions<string[]>;
  /**
   * disallow `eslint-disable` comments without rule names
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html
   */
  "eslint-comments/no-unlimited-disable": ESLintConfig.RuleWithoutOptions;
  /**
   * disallow unused `eslint-disable` comments
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unused-disable.html
   */
  "eslint-comments/no-unused-disable": ESLintConfig.RuleWithoutOptions;
  /**
   * disallow unused `eslint-enable` comments
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unused-enable.html
   */
  "eslint-comments/no-unused-enable": ESLintConfig.RuleWithoutOptions;
  /**
   * disallow ESLint directive-comments
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-use.html
   */
  "eslint-comments/no-use": ESLintConfig.RuleOptions<
    [
      {
        allow?: (
          | "eslint"
          | "eslint-disable"
          | "eslint-disable-line"
          | "eslint-disable-next-line"
          | "eslint-enable"
          | "eslint-env"
          | "exported"
          | "global"
          | "globals"
        )[];
      }
    ]
  >;
  /**
   * require include descriptions in ESLint directive-comments
   * https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/require-description.html
   */
  "eslint-comments/require-description": ESLintConfig.RuleOptions<
    [
      {
        ignore?: (
          | "eslint"
          | "eslint-disable"
          | "eslint-disable-line"
          | "eslint-disable-next-line"
          | "eslint-enable"
          | "eslint-env"
          | "exported"
          | "global"
          | "globals"
        )[];
      }
    ]
  >;
}

declare global {
  namespace ESLintConfig {
    interface PluginRules {
      "eslint-comments": EslintCommentsPluginRules;
    }
    interface PluginConfigs {
      "eslint-comments": { "plugin:eslint-comments/recommended": true };
    }
  }
}
