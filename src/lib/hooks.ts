import React from "react";
import { assert } from "./util";
////////// GEN EFFECT

export type GenEffect = Iterator<IArguments | any[] | undefined | void, void | (() => void)>;

function isValidDependencies(val: any): val is React.DependencyList {
    // REact doesn't officially support IArguments objects but it does support indexing needed
    return val instanceof Array || Object.prototype.toString.call(val) === "[object Arguments]";
}
/**
 * runs a react effect that is specified by a GenEffect function.
 * A GenEffect function is a generator function that starts with yielding it's arguments
 * (this is used as the dependency list for the effect to rerun) or an alternate depedency list
 * then does effect. If there is cleanup you can either return a cleanup function like standard in useEffect
 * or do yield a second time then do cleanup after that.
 * function* effect1(args){
 *     yield arguments // this is actual "arguments" keyword
 *     // do effect
 *     yield
 *     // do cleanup
 * }
 * function* effect2(args){
 *     yield arguments
 *     // do effect
 *     return ()=>{
 *           // cleanup here
 *     }
 * }
 *
 * @param effect genEffect to run.
 * @see GenEffect
 */
export function useGenEffect(effect: GenEffect) {
    const { value: deps, done } = effect.next();
    assert(!done, "gen effect did not yield dependencies");
    assert(isValidDependencies(deps), "gen effect must yield arguments or a list of dependencies.");
    return React.useEffect(() => {
        const result = effect.next();
        if (result.done) {
            // no second yield, return value may be cleanup function.
            return result.value;
        }
        // otherwise there was a second yield, ensure no data was given
        assert(result.value === undefined, "second yield cannot produce data.");
        return () => {
            const final = effect.next();
            assert(final.done, "gen effect did not exit after cleanup.");
            assert(
                final.value === undefined,
                "gen effect returned value with 2 yield form which is not allowed.",
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps]);
}

export function effectFactory<A extends any[], R>(
    callback: (...args: A) => R,
    cleanup: (this: R, ...args: A) => void,
) {
    function* Effect(...args: A): GenEffect {
        yield args;
        const r = callback(...args);
        yield;
        cleanup.apply(r, args);
    }
    return Effect;
}
// TODO: need to figure out how to let the first overload get used instead of the more general one
// effectFactory will preserve generics, but not if the last overload is totally not useful.

/** call signature of addEventListener and removeEventListener with useful generics */
type _NiceOverload = <K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
) => void;
/**
 * object of a few useful effects, intended to be passed to useGenEffect.
 */
export const geneffs = {
    /** registers event listener */
    eventListener: effectFactory(
        window.addEventListener as _NiceOverload,
        window.removeEventListener as _NiceOverload,
    ),
    /** applies focus to the referenced element when takeFocus switches to true. */
    *focus(ref: React.RefObject<HTMLElement>, takeFocus: boolean) {
        yield [ref.current, takeFocus];
        if (takeFocus && ref.current) ref.current.focus();
    },
};

/**
 * returns {value, onChange} object which can be passed as props to an input tag.
 * ```typescript
 * const nameInput = useFormInput("dave");
 * const passwordInput = useFormInput("pass");
 * return <form>
 *     <input {...nameInput}/>
 *     <input {...passwordInput}/>
 * </form>
 * ```
 */
export function useFormInput(initialValue: string) {
    const [value, change] = React.useState(initialValue);
    // initial implementation using useReducer to read the event is broken since React is now using
    // synthetic events which get cleared by the time the reducer actually gets called so now we
    // need to cache the function ourselves :(
    const onChange = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => change(ev.target.value),
        [change],
    );
    return { value, onChange };
}

/**
 * returns a ref to be applied to an object which should take focus when the passed condition switches to true
 * this is just useRef then calls useGenEffect(geneffs.focus(ref,focusNow))
 */
export function useFocus(focusNow: boolean) {
    const ref = React.useRef<HTMLElement>(null);
    useGenEffect(geneffs.focus(ref, focusNow));
    return ref;
}
