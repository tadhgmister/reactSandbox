type NeverKeys<T> = { [K in keyof T]: [T[K]] extends [never] ? K : never }[keyof T];
type OmitNeverKeys<T> = Omit<T, NeverKeys<T>>;

type A<T> = OmitNeverKeys<{
    n: T extends number ? number : never;
    s: T extends string ? string : never;
}>;
const a: A<string> = {
    s: "blah",
};
enum Mutability {
    ENABLED,
    DISABLED,
}

interface Demo<HasRules extends boolean> {
    rules: HasRules extends true ? string : undefined;
}

const x: Demo<false> = { rules: "" };
