import type { ESLintConfig } from "/Users/tadhgmcdonald-jensen/Documents/coding/typescript-eslint/packages/typed-config/dist/index";

// type Rules = ESLintConfig.Config["rules"];
interface Rules {
    a: "error";
    b: "error";
    c: "error";
}
type Keys = keyof Rules;
type F<K extends Keys> = (dev: boolean) => Pick<Rules, K>;
type F1<R extends Partial<Rules>> = (dev: boolean) => R;
/*
need to have helper such that:
- allows only valid rules to be specified, don't want to allow random strings.
    - using `extends rules` won't work since that allows extra keys
- error on specifying a rule that was already specified before

*/
