// import React from 'react';
import { effectFactory, useGenEffect } from "./hooklib";
import React from "react";
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
        yield arguments;
        if (takeFocus && ref.current) ref.current.focus();
    },
};

function inputReducer(v: any, ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.target.value;
}
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
    const [value, onChange] = React.useReducer(inputReducer, initialValue);
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
