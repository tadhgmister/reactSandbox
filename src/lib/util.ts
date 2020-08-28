/**
 * Asserts the given condition, throws an error if condition is not met
 * @param cond condition to assert
 * @param mes message to output in error if condition is not met.
 */
export function assert(cond: any, mes: string): asserts cond {
    // an asserts function kind of needs the any input type,
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!cond) {
        throw new Error(mes);
    }
}
/**
 * issues a warning if condition is not met, still asserts typesafety.
 * Used for non hard requirements.
 * @param cond condition to check
 * @param mes message to be printed in warnings if not true
 */
export function ensure(cond: any, mes: string): asserts cond {
    // an asserts function kind of needs the any input type,
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!cond) {
        // this is one of the places where I want to keep a console warn.
        // eslint-disable-next-line no-console
        console.warn(mes);
    }
}
// /**
//  * functional equivelent to type Record, takes list of keys and makes object.
//  * @param keys list of keys
//  * @param value value to assign each key to. if mutable will be same reference for each.
//  */
// export function Record<K extends keyof any, V>(keys: K[], value: V) {
//     // technically this isn't guarenteed to give all keys since `Record<'a'|'b'|'c', string>(['a'], 'hi')`
//     // would work but type would be wrong... actually is this function even a good idea?
//     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
//     const result = {} as Record<K, V>;
//     for (const k of keys) {
//         result[k] = value;
//     }
//     return result;
// }
/** https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline */
interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
}
declare global {
    interface Window {
        /** https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback */
        requestIdleCallback?(
            callback: (info: IdleDeadline) => void,
            options?: { timeout?: number },
        ): number;
    }
}
/**
 * This uses the requestIdleCallback API to wait until the event loop is idle
 * If the browser doesn't support that feature this is undefined
 * @param timeout in milliseconds, a rough max time to wait before resolving.
 * @returns true if timeout exceeded, false if idle time was found.
 */
export const waitUntilIdle = window.requestIdleCallback === undefined ? undefined : _waitUntilIdle;
async function _waitUntilIdle(timeout?: number) {
    return new Promise<boolean>((resolve) => {
        // this internal function assumes it exists, the line right above makes it only exported if it does exist.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.requestIdleCallback!((info) => resolve(info.didTimeout), { timeout });
    });
}
/**
 * sets a timeout to wait the given number of milliseconds.
 * @param timeout time in milliseconds to wait
 */
export async function wait(timeout: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, timeout));
}
interface MainTypes {
    string: string;
    number: number;
    bigint: bigint;
    boolean: boolean;
    symbol: symbol;
    undefined: undefined;
    object: object;
    function: Function;
}
/**
 * does a typeof check but (particularly for functions or classes) doesn't
 * assert a type like (Original | Function) making it annoying to use.
 * @param obj any object
 * @param type string for the type to check
 */
export function isA<T, K extends keyof MainTypes>(
    type: K,
    obj: T,
): obj is Extract<T, MainTypes[K]> {
    return typeof obj === type;
}
/**
 * alias to Object.keys but types the return as (keyof T)[] instead of string[]
 * @param obj any object
 */
export function ObjectKeys<T>(obj: T) {
    return Object.keys(obj) as (string & keyof T)[];
}
/**
 * alias to Object.entries but types as [keyof T, T[keyof T]] which is more useful.
 * @param obj any object
 * @param predicate function to filter the values to only a subset.
 */
export function ObjectEntries<T, V extends T[string & keyof T] = T[string & keyof T]>(
    obj: T,
    predicate?: (v: T[string & keyof T]) => v is V,
) {
    let entries = Object.entries(obj);
    if (predicate !== undefined) {
        entries = entries.filter(([k, v]) => predicate(v));
    }
    return entries as Array<[string & keyof T, V]>;
}
/**
 * returns true if object is not undefined
 * useful for type predicates that get passed into other functions.
 * @param obj any object
 */
// it's unlikely that a variable would be type void, but just in case I want to leave it there.
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export function isDefined<T>(obj: T): obj is Exclude<T, undefined | void> {
    return obj !== undefined;
}
/**
 * similar to Array.map but for the fields of an object.
 * the callback takes the value as first argument and key as second.
 * does not support passing object as 3rd argument or thisArg.
 */
export function objectMap<T, V>(obj: T, fn: (val: T[keyof T], key: keyof T) => V) {
    // this is one of the cases where the as Record followed by a loop initializing all the keys
    // the whole reason this function exists is to have this typesafe outside :)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const newObj = {} as Record<keyof T, V>;
    for (const [key, val] of ObjectEntries(obj)) {
        newObj[key] = fn(val, key);
    }
    return newObj;
}
/**
 * alias to JSON.stringify that uses indent of 4, used because (data,undefined,4) is annoying
 * especially with magic numbers being warning
 * @param data data to stringify
 * @param indent indent, defaults to 4
 */
export function JSONstringify(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return JSON.stringify(data, undefined, 4);
}
