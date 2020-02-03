/**
 * Asserts the given condition, throws an error if condition is not met
 * @param cond condition to assert
 * @param mes message to output in error if condition is not met.
 */
export function assert(cond: any, mes: string): asserts cond {
    if (!cond) {
        throw new Error(mes);
    }
}
/**
 * issues a warning if condition is not met, still asserts typesafety.
 * Used for non hard requirements.
 * @param cond condition to check
 * @param mes message to be printed in warnigns if not true
 */
export function ensure(cond: any, mes: string): asserts cond {
    if (!cond) {
        console.warn(mes);
    }
}
export function Record<K extends keyof any, V>(keys: K[], value: V) {
    const result = {} as Record<K, V>;
    for (const k of keys) {
        result[k] = value;
    }
    return result;
}

interface IdleDeadline {
    didTimeout: boolean;
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
 */
export const waitUntilIdle = window.requestIdleCallback === undefined ? undefined : _waitUntilIdle;
function _waitUntilIdle(timeout?: number) {
    return new Promise<void>(resolve => {
        window.requestIdleCallback!(info => resolve(), { timeout });
    });
}
/**
 * sets a timeout to wait the given number of milliseconds.
 * @param timeout time in milliseconds to wait
 */
export function wait(timeout: number) {
    return new Promise<void>(resolve => window.setTimeout(resolve, timeout));
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
 * does a typeof check but (particularly for functions or classes) doesn't assert a type like (Original | Function)
 * making it annoying to use.
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
    return Object.keys(obj) as (keyof T)[];
}
/**
 * alias to Object.entries but types as [keyof T, T[keyof T]] which is more useful.
 * @param obj any object
 * @param predicate function to filter the values to only a subset.
 */
export function ObjectEntries<T, V extends T[keyof T] = T[keyof T]>(
    obj: T,
    predicate?: (v: T[keyof T]) => v is V,
) {
    let entries = Object.entries(obj);
    if (predicate !== undefined) {
        entries = entries.filter(([k, v]) => predicate(v));
    }
    return entries as Array<[keyof T, V]>;
}
/**
 * returns true if object is not undefined
 * useful for type predicates that get passed into other functions.
 * @param obj any object
 */
export function isDefined<T>(obj: T): obj is Exclude<T, undefined> {
    return obj !== undefined;
}
// /**
//  * returns a new object which is a subset of passed data, only containing keys-values that met the predicate
//  * @param data data
//  * @param predicate predicate to choose which keys to keep
//  */
// export function Partial<T, A extends T[keyof T]>(data: T, predicate: ((val: T[keyof T], key: keyof T)=> val is A)){
//     const result: Partial<Record<keyof T, A>> = {};
//     for(const [k,v] of ObjectEntries(data)){
//         if(predicate(v, k)){
//             result[k] = v;
//         }
//     }
//     return result as unknown as Pick<T, { [K in keyof T]: T[K] extends A ? K : never; }[keyof T]>;
// }
