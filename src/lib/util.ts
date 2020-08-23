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
    return new Promise<void>((resolve) => {
        window.requestIdleCallback!((info) => resolve(), { timeout });
    });
}
/**
 * sets a timeout to wait the given number of milliseconds.
 * @param timeout time in milliseconds to wait
 */
export function wait(timeout: number) {
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
export function isDefined<T>(obj: T): obj is Exclude<T, undefined> {
    return obj !== undefined;
}

export async function fetchFolderContent(subPath = "") {
    const response = await fetch("/api/indexof/" + subPath);
    const body = await response.text();
    if (body === "null") {
        throw new Error("invalid folder name: " + subPath);
    }
    return JSON.parse(body) as string[];
    //.then(data=>data.text().then(data=>{
    //     this.setState({songs: JSON.parse(data)});
    // }));
}
