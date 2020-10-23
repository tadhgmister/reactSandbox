// @ts-check

/// <reference path="/Users/tadhgmcdonald-jensen/Documents/coding/typescript-eslint/.eslintrc_types/eslintBaseRules.d.ts" />
/// <reference path="/Users/tadhgmcdonald-jensen/Documents/coding/typescript-eslint/.eslintrc_types/eslint-plugin-@typescript-eslint.d.ts" />

// const {
//     typedConfig,
// } = require("/Users/tadhgmcdonald-jensen/Documents/coding/typescript-eslint/packages/typed-config/dist/index");

/**
 * these rules are enabled for very good reasons, the alternative is bad.
 * all rules labeled as errors should be in here, any that are warn should have auto-fixes.
 * no style related rules should be strict, only logic breaking stuff.
 * @param {boolean} dev whether to lessen the strictness for development purposes
 * @return {ESLintConfig.Config["rules"]}
 */
const strict = (dev = true) => ({
    //////// STRICT - TYPESCRIPT-ESLINT ////////
    /**
     * it can be easy to define a method in interface twice by accident
     * (in class if both have implementation that is already an error)
     * in this case it's almost always an accident, if the intent is to be
     * overloads then they should be put next to each other.
     */
    "@typescript-eslint/adjacent-overload-signatures": "error",
    /**
     * `Array(n)` creates an empty array with space for `n` elements
     * `Array(n, a, ...)` creates a new array with those elements, equivalent to `[n,a,...]`
     * it is almost always a mistake to use array constructor instead of just []
     * except when passing explicit generic to Array in order to ensure
     * correct type which is allowed by the typescript rule.
     */
    "@typescript-eslint/no-array-constructor": "error",
    "no-array-constructor": "off",
    /**
     * this rule will help point people towards the Map and Set data structure.
     * there are weird things that can happen when the field overlaps with built in names.
     */
    "@typescript-eslint/no-dynamic-delete": "error",
    /**
     * this rule only checks that you don't have repeated !! within the same statement
     * it's fine to do a null assertion on a value that can't be null (which is useful for development during refactoring)
     */
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    /**
     * don't use x! assertion after a x?.f chain, it doesn't make any sense.
     * the whole point of the x?.f syntax is to end up undefined if the original object was undefined
     * there is absolutely no reason to then say "either way treat it like it was definitely defined"
     * the correct alternative is `x!.f` to say "I know x is defined, give me f"
     */
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
    /** you want for-of loop for an array, not for-in. */
    "@typescript-eslint/no-for-in-array": "error",
    /**
     * the solution to implied-eval is almost always just don't use a string
     * but in the rare case that you are justified in doing whatever you are doing
     * then you can override this error with a very good explanation of how you know you aren't going to break stuff
     * and why you can't just use a plain function.
     */
    "@typescript-eslint/no-implied-eval": "error",
    /**
     * it only makes sense to use void for return type, try to use undefined when you can
     * there are cases like the second generic to Iterator which represents a return of the generator
     * that there it makes a lot of sense to use void
     */
    "@typescript-eslint/no-invalid-void-type": ["error", { allowInGenericTypeArguments: true }],
    /**
     * on a class `constructor` refers to the initialization code and `new` is a method
     * on an interface `new` is the constructor signature and `constructor` is a method
     * it's silly but true, so to avoid any confusion just don't make a method called `constructor` or `new`
     * also note that `new` is saying that the interface can be used like a class, it can be called with `new X()`
     * the interface for an object doesn't need to define a constructor because just using the object the constructor is irrelevant.
     */
    "@typescript-eslint/no-misused-new": "error",
    /**
     * namespaces are outdated, just use a separate file to store stuff.
     * this is set to warn instead of error because in the event code is taken from elsewhere that
     * uses namespace then it shouldn't be blocked
     */
    "@typescript-eslint/no-namespace": [
        "warn",
        { allowDeclarations: true, allowDefinitionFiles: true },
    ],
    /** imports give type-safety, require function does not.  Use import. */
    "@typescript-eslint/no-require-imports": "error",
    /**
     * triple slash references are out dated, use import instead.
     * // TODO: is this already allowed in js files or do I need an override?
     */
    "@typescript-eslint/triple-slash-reference": "error",
    /**
     * javascript allowing throwing non errors is crazy, if you want to throw an error then `throw new Error('msg')`
     * if you are using throw to pass data in a different control flow, then first consider if your code can be refactored to not use throw.
     * if it can't be refactored then it may be acceptable to override this rule with clear comments for what you are doing,
     * but always try to refactor first.
     */
    "@typescript-eslint/no-throw-literal": "error",
    /**
     * should always use @ts-expect-error instead of @ts-ignore
     */
    "@typescript-eslint/prefer-ts-expect-error": "error",
    /**
     * ts-ignore is covered by prefer-ts-expect-error,
     * ts-expect-error and ts-nocheck are ok for short term development,
     * but you should almost always just use a cast to any instead.
     */
    "@typescript-eslint/ban-ts-comment": dev ? "warn" : "error",

    //////// STRICT - BASE ESLINT ////////
    /**
     * index is increasing and condition is checking when it is greater than a value
     * this is frequently nonsense and an easy typo, so this is a nice rule.
     */
    "for-direction": "error",
    /**
     * accidentally putting an assignment instead of a condition is easy enough to do and hard enough to spot that
     * this is error. However the use case like: `while(data = getData())` should use an additional check like:
     * `while(isDefined(data = getData())){}` or `(data=getData())!==""` is considered valid
     */
    "no-cond-assign": ["error", "always"],
    /**
     * using debugger() is ok during short term development, but must always be removed.
     */
    "no-debugger": dev ? "warn" : "error",
    /**
     * you almost certainly didn't mean to have duplicate case.
     */
    "no-duplicate-case": "error",
    /**
     * empty blocks should always contain at least a comment for why they are empty
     * warning is useful as "revisit" marker, rather not set to error for that reason.
     */
    "no-empty": ["warn", { allowEmptyCatch: false }],
    /**
     * a regex `[]` doesn't match anything, a regex containing an empty set is probably wrong.
     * would set to error if the red underline was only under the empty set
     * but as underlining the entire regex makes it not immediately obvious how to fix
     * so this is set to warn.
     */
    "no-empty-character-class": dev ? "warn" : "error",
    /**
     * want this grouped with no-empty-character-class, also warning from invalid regex.
     */
    "no-misleading-character-class": "warn",
    /**
     * there is absolutely no reason to reassign the error parameter.
     */
    "no-ex-assign": "error",
});

/**
 * these rules are recommendations to improve quality but not strict.
 * it is acceptable to disable a rule for a specific case with a comment explaining why.
 * @param {boolean} dev whether to lessen the strictness for development purposes
 * @return {ESLintConfig.Config["rules"]}
 */
const recommended = (dev = true) => ({
    /**
     * ts already gives a note, would like it to be a little more noticeable.
     * I really want it to be ok with awaiting on `T | Promise<T>`
     * and my testing of the rule ran into some issues, will try later.
     * TODO: test this again
     */
    "@typescript-eslint/await-thenable": "warn",
    /**
     * calling an async function should have some kind of consideration for error handling:
     * - inside an async function using `await` throws an error if the promise fails
     * - calling `.then` should pass a second callback for handling error
     * - if the result isn't used using `.catch` to handle an error.
     * If there isn't really anything reasonable you can do for error then use `void` to indicate
     * you aren't dealing with the promise, if it fails then it fails.
     */
    "@typescript-eslint/no-floating-promises": [dev ? "warn" : "error", { ignoreVoid: true }],
    /**
     * generally don't want to use String, Number, Boolean etc. with capital
     * I don't think there is an actual difference as far as typescript is concerned
     */
    "@typescript-eslint/ban-types": [
        "warn",
        {
            extendDefaults: true,
            types: {
                // TODO: should there be additional types I want to ban?
            },
        },
    ],
    /**
     * readonly is preferred for constants, just because getters are a little more footprint
     * technically I'd prefer global constants over instance constants
     * but I wouldn't enforce "no readonly literals" since that is just discouraging
     * using readonly then, so this is fine.
     */
    "@typescript-eslint/class-literal-property-style": ["warn", "fields"],
    /**
     * interfaces are slightly preferred in cases where they are applicable,
     * mapped types `{[k in keyof T]: string}` are only valid in type so
     * it is possible that during refactoring the auto-fix will change a type to
     * interface then it has to be manually changed back to use mapped type
     * if this does get annoying then this rule should be disabled in dev mode.
     */
    "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
    /**
     * it is fine to override this for backwards compatibility, although if it does come up
     * then the function signature should probably be deprecated.
     * parameters that have reasonable default arguments should be at the end so the caller
     * doesn't have to explicitly pass undefined,
     * I always get annoyed that `JSON.stringify(x, undefined, 3)` needs 2nd argument to get indent
     * just put required arguments first.
     */
    "@typescript-eslint/default-param-last": "warn",
    /**
     * prefer to always mark visibility since private members that are unused give notification
     * but public fields that are unused anywhere are not indicated.
     * for this reason it's preferable to keep all fields intended to use internally private
     * so we will enforce visibility modifiers so there needs to be a conscious decision.
     */
    "@typescript-eslint/explicit-member-accessibility": [
        "warn",
        {
            accessibility: "explicit",
            overrides: {
                // it is so rare to have constructors that aren't public, so want no public on constructors
                constructors: "no-public",
            },
        },
    ],
    /**
     * this is designed to warn you when you are going to get `[Object object]`
     * or something equally un-useful inside a string. If it gives error incorrectly
     * it is possible the type of data has a good `.toString()` method that is not in the known type
     * so the correct solution is probably just declare that it's there:
     * ```ts
     * interface MyClass {
     *     /**
     *      * SomeLibraryClass implements a toString (verified empirically)
     *      * but type doesn't contain it. so we are declaring that it exists so
     *      * eslint rule `no-base-to-string` doesn't complain when we print it.
     *      // END COMMENT OMITTED BECAUSE THIS IS IN JSON
     *      toString(): string;
     *  }
     *  class MyClass extends SomeLibraryClass {
     *      // code here
     *  }
     * ```
     */
    "@typescript-eslint/no-base-to-string": "warn",
    /**
     * empty function body doesn't error if the body contains a comment so in nearly all
     * cases a function should at least contain a comment explaining why it exists but does nothing.
     * only exception is private or protected constructor.
     */
    "@typescript-eslint/no-empty-function": [
        "warn",
        { allow: ["private-constructors", "protected-constructors"] },
    ],
    /** see @typescript-eslint/no-empty-function */
    "no-empty-function": "off",
    /**
     * these are equivalent: `interface Foo extends Bar {}` and `type Foo = Bar`
     * due to templates having an interface extend a single type with the intent to possibly add
     * members later (props) should be allowed.
     */
    "@typescript-eslint/no-empty-interface": ["warn", { allowSingleExtends: true }],
    /**
     * if a class doesn't actually do anything that makes sense to structure into a class
     * then give a warning, it is typical to get this when first creating a class but once it has some
     * functionality then it should go away, if the warning persists then reconsider whether it makes sense to use a class.
     * allows empty classes since that can be useful for templates and such.
     */
    "@typescript-eslint/no-extraneous-class": [
        "warn",
        { allowEmpty: true, allowWithDecorator: true },
    ],
    /**
     * having a bunch of numbers appear in equations can be really hard to track,
     * even if it's just on the line before you do `const secInHour = 3600` it can
     * highly improve readability, especially once you inevitably realize you need to reuse the number more than once.
     */
    "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
            /** allow few small numbers, I strongly prefer using `x+=1` over `x++` */
            ignore: [-1, 0, 1, 2],
            /** enums should absolutely be allowed to use arbitrary numbers */
            ignoreEnums: true,
            /** readonly class properties is a fine place to put magic numbers :) */
            ignoreReadonlyClassProperties: true,
            /** might want to remove this, not sure of a case where not using const would be wanted. */
            enforceConst: true,
            /** probably won't ever matter, but would like to allow in types. */
            // ignoreNumericLiteralTypes: true,
        },
    ],
    /** see @typescript-eslint/no-magic-numbers */
    "no-magic-numbers": "off",
    /**
     * while I consider using `any` for un type-safe code as ok, I do think that calling
     * functions should have some kind of info that it's a function.
     */
    "@typescript-eslint/no-unsafe-call": "warn",
    /**
     * I'm all for inferring return type as much as possible, but returning type any
     * is kind of super unhelpful. If you are writing a function surely you know what format the return is.
     * most cases I expect this to show up is you return `JSON.parse` in which case even just `Record<string, unknown>` is better than any.
     * during development it's reasonable to ignore this until you get back to it, but functions should have anything better than any.
     */
    "@typescript-eslint/no-unsafe-return": "warn",
    /**
     * cases where maybe you expected to return an expression, particularly something like:
     * `arr.map(val=>{val})` is a function body, not object literal and while the returned array is `void[]`
     * it'd be nice to have the error directly on the `val` is expression on own.
     */
    "@typescript-eslint/no-unused-expressions": "warn",
    /** using `"hello" as "hello"` is super redundant, instead use `as const` */
    "@typescript-eslint/prefer-as-const": "warn",
    /**
     * if you loop over indices of an array and only use index to access array element:
     * `for(let idx=0; idx<arr.length; idx++){alert(arr[idx]);}`
     * this can be simplified to use a for-of loop:
     * `for(const elem of arr){alert(elem)}`
     * which is highly preferred, this rule would be better with an auto-fix :(
     */
    "@typescript-eslint/prefer-for-of": "warn",
    /** includes is a great feature, doing `indexOf(a) === -1` is outdated. */
    "@typescript-eslint/prefer-includes": "warn",
    /** statsWith and endsWith are much nicer than older alternatives */
    "@typescript-eslint/prefer-string-starts-ends-with": "warn",
    /**
     * apparently there are 2 functions that in a specific case do identical things
     * but one is objectively better, which kind of makes me wonder why the slower one isn't
     * just an alias to the faster one but ok, sure lets have ambiguity and leave it up to
     * linters to suggest using the better option.
     */
    "@typescript-eslint/prefer-regexp-exec": "warn",
    /**
     * a function marked as async will always return a promise, even one that fails
     * a non async function that returns a promise may throw an error or return a failed promise.
     * code that deals with the returned promise will rarely deal with also possibly throwing an error
     * so marking all promise-returning functions as async simplifies possible error logic.
     */
    "@typescript-eslint/promise-function-async": "warn",
    /**
     * async functions are allowed to return promises, so `return await x` is redundant
     * except inside a try/catch block where an error thrown by the promise would be caught by catch block.
     * so this gives warning for using `return await` outside since just returning the promise is perfectly fine.
     */
    "@typescript-eslint/return-await": ["warn", "in-try-catch"],
    "no-return-await": "off",
    /**
     * this mainly is to correct Promise<boolean> inside conditional.
     * but also putting random objects in a conditional is frequently to check if they are non nullish
     * in which case a function like isDefined would be clearer (and asserts type)
     */
    "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
            /**
             * boolean | null or `boolean?` is fine to pass to a condition to me,
             * defaulting to false would be preferable but there are cases that just doesn't work
             * and doing `== true` makes it definitely boolean but conflicts with no-unnecessary-boolean-literal-compare
             */
            allowNullableBoolean: true,
        },
    ],
    /**
     * overloads can make other types that manipulate the functions types not work
     * nearly as well as you might hope as well as occasionally cause undesired behaviour, like:
     * ```ts
     *  declare function f(x: number): void;
     *  declare function f(x: string): void;
     *
     *  declare const thing: number | string;
     *  f(thing); // not valid, doesn't match number or string overload.
     *  ```
     * so if the linter rule says you can unify the signatures please do :)
     */
    "@typescript-eslint/unified-signatures": "warn",

    //////// RECOMMENDED BASE ESLINT ////////
    /**
     * sort of a weird thing to do, put a function inside blocks
     * but I don't think it makes sense to deny it.
     */
    "no-inner-declarations": ["warn", "both"],

    /**
     * these are cases where semicolons change the meaning like:
     * ```ts
     * const x = thing
     * [1,2].map(..)
     * ```
     * without a semicolon this is interpreted as `thing[1,2].map(...)` so it becomes indexing.
     * Want to give warning about these, particularly because auto-formatter will join them in the way you didn't intend.
     */
    "no-unexpected-multiline": "warn",
    /**
     * return or throw inside a finally will do weird things and is different in different languages,
     * just don't do it if you can help it.
     */
    "no-unsafe-finally": "warn",
    /**
     * `!x instanceof Foo` resolves to `(!x) instanceof Foo` which is unhelpful.
     * this actually triggers along with ts(2358) (argument to instanceof must be object type)
     * and `The condition is always true.` from typescript-eslint/strict-boolean-expressions
     * this one is the only one that clearly indicates how to fix.
     */
    "no-unsafe-negation": "warn",
    /**
     * using `+= await` loads the value before await, then waits at which time the variable could change
     * then it does increment, so race condition can cause variable to become invalid.
     * shouldn't use await or yield in an incrementor.
     */
    "require-atomic-updates": "warn",
    /**
     * x === NaN always evaluates to false, use Number.isNaN instead.
     */
    "use-isnan": "warn",
});

/**
 * these rules are intended to catch common typos to ensure you are doing what you intend.
 * for example bitwise & and | are sometimes used in place of logical && and ||
 * so there is a rule that "disallows" bitwise operators, however it is fully expected that
 * if you do need a bitwise operator you should use a eslint-disable comment
 * that way the comment indicates to other programmers that you do indeed intend to be using bitwise.
 * @param {boolean} dev whether to lessen the strictness for development purposes
 * @return {ESLintConfig.Config["rules"]}
 */
const overridable = (dev = true) => ({
    /** see comments below for 2 parts this rule does. */
    "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
            /**
             * this is strict, there is no reason to use `<T>x` for type casting it's not valid in tsx file
             * and using it in a .ts file is probably trying to do JSX and being interpreted as typecast by accident.
             */
            assertionStyle: "as",
            /**
             * this is an important thing to know: `{} as T` doesn't raise an error if
             * the object is missing required fields, there are cases where that is fine
             * like if you are about to initialize all the fields in a loop right below
             * in which cases disabling the rule for that like is fine, but in general `as T` for
             * object literals can lead to missing fields which is bad
             */
            objectLiteralTypeAssertions: "never",
        },
    ],
    /**
     * null assertions are fine during development (as something to come back to after testing etc.)
     * but in general you should always at least do `assert(x !== undefined, "REASON HERE")` on the line above
     * so that if it does end up undefined when you weren't expecting you have a nice error message for the assumption
     * that was broken.
     *
     * It is also perfectly acceptable to disable this rule for a line with a comment explaining why you are certain
     * it is safe and why you can't convince typescript of the same.
     */
    "@typescript-eslint/no-non-null-assertion": dev ? "warn" : "error",
    /**
     * there are cases where an alias to `this` is necessary, just be sure to comment why it is
     * in addition to the comment to bypass this rule.
     */
    "@typescript-eslint/no-this-alias": ["warn", { allowDestructuring: true }],
    /**
     * technically `{(x: string):void}` is equivalent to `(x:string) => void`
     * the first is confusing, so discouraged. I don't expect this to come up much since
     * putting call signatures into interfaces is already pretty rare.
     * there is an edge case where this rule with it's auto-fix is actually very harmful
     * if there is a class that the constructor makes `this` a valid callable, an interface is needed
     * in parallel to the class to define the call signature for the instance.  In this case you absolutely need
     * an interface with the call signature, and the auto-fix makes a conflicting type definition to the
     * class instead of merging namespace.  In this case please disable the rule.
     */
    "@typescript-eslint/prefer-function-type": "warn",
    /**
     * use `x ?? y` if it should resolve to y if x isn't null or undefined
     * use `x || y` if it should resulve to y if x is 0,'',false,null,undefined
     * in the second case a comment disabling this rule will indicate the need for that behaviour.
     * also explcitly disable auto-fix so that `(boolean | undefined) || other` is not auto converted.
     */
    "@typescript-eslint/prefer-nullish-coalescing": ["warn", { forceSuggestionFixer: true }],
    /**
     * see above rule, `x && x.a` almost always should just be `x?.a` but for 0 or ''
     * the behaviour is slightly different, override if needed but almost certainly use optional chaining
     */
    "@typescript-eslint/prefer-optional-chain": "warn",
    /**
     * I rarely use reduce because it's weird, apparently this is a preferable way that is less bug prone?
     * I don't particularly believe it, it doesn't make this compile:
     *  const a = ["a", "b"] as const;
     *  a.reduce<Record<typeof a[number], true>>((obj, n) => ({ ...obj, [n]: true }), {});
     * and in this case I know the typecast would be valid but only because it uses typeof a in it
     * so I can see how using type cast would let in issues, like if I had given it different keys
     * it would be considered as definitely existing. So in a case like this the typecast seems reasonable
     * either way I feel like you should be aware of the rule and override it explicitly if you need the typecast.
     */
    "@typescript-eslint/prefer-reduce-type-parameter": "warn",
    /**
     * the classic [3,20,100].sort() sorting numbers alphabetically is annoying
     * note that `strArr.sort((a, b) => a.localeCompare(b))` is preferred for strings.
     * but just a comment to disable rule is perfectly fine.
     */
    "@typescript-eslint/require-array-sort-compare": "warn",
    /**
     * during refactoring it is frequently helpful to have it pointed out that there is
     * no longer any reason for a function to be async, but it is equally useful to
     * be allowed to just ignore that information instead of further refactoring it.
     *
     * after finishing refactoring if a function still needs to be marked async without any awaits
     * then it needs a disable comment along with explanation for why it's still async.
     */
    "@typescript-eslint/require-await": dev ? "warn" : "error",
    /**
     * accidentally grabbing unbound methods can lead to `undefined this` errors.
     * this will flag possible issues, if you know it's a false positive then disable per use
     * if this is raising a lot of false positives then probably disable the rule.
     */
    "@typescript-eslint/unbound-method": "warn",
    /**
     * TODO: clean up this docs
     * there are cases where use of async functions are unintuitive,
     * in these cases you should probably consider what the code will actually do
     * keeping in mind that when library code calls your async function it immidiately starts
     * running and if it does any await then other code can continue right away, so a
     * `arr.forEach` passed an async function will run each element essentially in parllel.
     * it is quite possible that cases this flags as issue are actually not and commenting on why is fine.
     */
    "@typescript-eslint/no-misused-promises": ["warn"],
    /**
     * for the most part the rule `prefer-template` and it's auto fix cover this
     * for additional cases typescript allows some things that are probably mistakes:
     * `let x: string | undefined;  x+="more text"` is perfectly acceptable to typescript
     * since adding undefined to a string is allowed.
     * this is enabled as warning so you consciously consider if adding makes sense for the types being used.
     * in cases where it might be weird the comment to disable the rule is sufficient
     */
    "@typescript-eslint/restrict-plus-operands": ["warn", { checkCompoundAssignments: true }],
    /**
     * this overlaps somewhat with strict-boolean-expressions
     * but this also covers unnecessary optional chaining which can be nice to point out after refactoring
     */
    "@typescript-eslint/no-unnecessary-condition": ["warn", { allowConstantLoopConditions: true }],

    /**
     * usually typescript knows the condition will be unconditionally false the second time
     * in some cases this may catch you where typescript won't.
     */
    "no-dupe-else-if": "warn",
    /**
     * doing ${x} inside '' or "" will be the literal characters, you need backtick `` to be a template
     * if you intend to use the literal characters `${` in a string then override this rule.
     * just the comment to disable the rule is enough to clearly convey intent.
     */
    "no-template-curly-in-string": "warn",
    /**
     * overruling this with eslint-disable is totally fine.
     * usually second comma is accident and if intentional then
     * the eslint comment means the reader is expecting a sparse array.
     */
    "no-sparse-arrays": "warn",
    /**
     * there are cases where the loop should be parallelized and cases where it can't
     * this rule makes you consider if you can improve and either change it or disable for the specific case.
     */
    "no-await-in-loop": "warn",
    /**
     * logging info is useful while debugging and frequently you intend to remove your debugging afterwards.
     * so the intent is to bring attention to short term uses of console and
     * let long term console have eslint-disable comments
     * TODO: offer a clear cut alternative to just disabling this rule for long term console use.
     */
    "no-console": "warn",
    /**
     * checking for control characters is unusual enough that if you did it by accident
     * this rule with catch you, and if you do intend then the disable-next-line is sufficient
     * to indicate your intent.
     */
    "no-control-regex": "warn",
});
/**
 * this contains rules that are intended primarily for their auto fix,
 * things like inconsistent whitespace and sorting imports.
 * All rules in this config should have auto fix that improves style.
 * @param {boolean} dev whether to lessen the strictness for development purposes
 * @return {ESLintConfig.Config["rules"]}
 */
const autoFix = (dev = true) => ({
    /**
     * Prefer braces to be "1 true brace style" and allow single line.
     * not sure if this will conflict with prettier,
     */
    "@typescript-eslint/brace-style": ["warn", "1tbs", { allowSingleLine: true }],
    "brace-style": "off",

    /**
     * prefer x.a instead of x["a"], except when `x["a"]` is accessing private variables in which case
     * typescript correctly types `x["a"]` without complaining that it is private.
     * Kept enabled so if the visibility changes the auto fix will be helpful.
     */
    "@typescript-eslint/dot-notation": [
        "warn",
        { allowPrivateClassPropertyAccess: true, allowKeywords: true },
    ],
    /**
     * cases where using semicolon vs comma would matter is mainly:
     * 1. changing an interface to a class, in which case commas are invalid
     *   - also requires adding implementations and explicit visibility
     * 2. copy an interface or type literal to an object to write each field, in which case semicolons are invalid
     *   - also requires changing types to actual values
     * Since both cases require some kind of additional work whether to use semi or comma is pretty minor.
     */
    "@typescript-eslint/member-delimiter-style": "warn",
    /**
     * removing extra semicolons is nice, the main use is that arrow function properties in a class
     * should have semicolons but methods don't, so changing from arrow <--> method fixing semicolons automatically is nice.
     */
    "@typescript-eslint/no-extra-semi": "warn",
    "no-extra-semi": "off",
    /**
     * use typescript inference when ever you can, particularly `const a = 5` types it as `5`
     * so adding type `number` actually loses information
     * (even though it rarely makes a difference it is useful for dev inspection)
     */
    "@typescript-eslint/no-inferrable-types": "warn",
    /**
     * using `== true` or similar is redundant, this will remove it to use the boolean directly.
     * default doesn't complain if the type might be null or undefined which is perfectly reasonable.
     */
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
    /**
     * during development this only warns about inline lambdas, then at compile time will warn about any unmodified field.
     * this is so compile auto-fix will add `readonly` to fields that are never modified and during development the auto-fix
     * doesn't add readonly to a field that will be mutated but code hasn't been written yet.
     */
    "@typescript-eslint/prefer-readonly": dev ? ["warn", { onlyInlineLambdas: true }] : "warn",
    /**
     * double quotes are preferred because they are compatible with JSON and HTML
     * however all cases where a `"` character appears in the string
     * using something else is fine.
     */
    "@typescript-eslint/quotes": ["warn", "double", { avoidEscape: true }],
    quotes: "off",
    /**
     * prefer template when possible
     */
    "prefer-template": "warn",
    /**
     * redundant boolean casts is silly, especially since the typical `!!x` is usually not sound logic
     */
    "no-extra-boolean-cast": "warn",
    /**
     * multiple spaces gets replaced with ` {3}` in regex, so if you want 5 spaces you can
     * hit space bar 5 times then apply the auto-fix, or just use ` {5}` manually.
     */
    "no-regex-spaces": "warn",
    // /**
    //  * kind of wish the auto fix could reorder all the imports like tslint did,
    //  * alas, it only sorts members within a single import so this is toned down to only warn about the thing it can fix.
    //  */
    // "sort-imports": [
    //     "warn",
    //     // { allowSeparatedGroups: true, ignoreCase: true, ignoreDeclarationSort: true },
    // ],
});
/** @type {ESLintConfig.Config["rules"]} */
const unsorted = {
    /**
     * will let the auto formatter put in semicolons
     * and what I really want is to warn of statements that
     * may be automatically joined by the formatter unintentionally
     */
    "@typescript-eslint/semi": "off",
    semi: "off",
    // TODO: come back to this, may end up putting it in noop instead.
    "@typescript-eslint/member-ordering": ["off"],
    // TODO: come back to this.
    "@typescript-eslint/naming-convention": ["warn"],
    /**
     * prettier always puts it after, I'd rather before, disabling.
     */
    "generator-star-spacing": ["off", "before"],
};
/** @type {ESLintConfig.Config} */
const config = {
    root: true,

    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        // project: [], // TODO: put tsconfig here.
        // tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
        ecmaFeatures: {
            impliedStrict: true,
            jsx: true,
        },
        ecmaVersion: 2020,
    },

    plugins: ["@typescript-eslint"],
    env: {
        es6: true,
    },
    rules: {
        ...autoFix(),
        ...overridable(),
        ...recommended(),
        ...strict(),
    },
};
const a = {
    $schema: "",
    
}
module.exports = config;
