type ResolvePromise<T> = T extends Promise<infer A> ? A : T;
type PromisifyIf<R, D> = R extends Promise<infer A> ? R : D extends Promise<any> ? Promise<R> : R;

function* map<T, U = T>(
    arr: T[],
    func: (a: T) => U,
): Generator<U, ResolvePromise<U>[], ResolvePromise<U>> {
    const newarr: ResolvePromise<U>[] = [];
    for (const elem of arr) {
        const val = func(elem);
        let x = yield val;
        newarr.push(x);
    }
    return newarr;
}

export function wrapGenForMaybeAsyncFunc<P extends any[], T, R>(
    genFunc: (...args: P) => Generator<T, R, ResolvePromise<T>>,
) {
    // ts-ignore
    function wrapper(...args: P) {
        const gen = genFunc(...args);
        return next(undefined as any);
        function next(val: ResolvePromise<T>): PromisifyIf<R, T> {
            // Note: val is changed as variable in the loop.
            let result: IteratorResult<T, R>;
            while (true) {
                result = gen.next(val);
                if (result.done) {
                    return result.value as PromisifyIf<R, T>;
                } else if (result.value instanceof Promise) {
                    return result.value.then(next) as PromisifyIf<R, T>;
                } else {
                    // keep iterating
                    val = result.value as any; // as Exclude<T,Promise<any>>;
                }
            }
        }
    }
    return wrapper;
}

// const a = wrapGenForMaybeAsyncFunc(map);

// declare function M(b: number): string | Promise<boolean>;
// const x = a([1, 2, 3], M);
