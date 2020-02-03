// import React from 'react';
import { effectFactory } from "./hooklib";
/** call signature of addEventListener and removeEventListener with useful generics */
type _NiceOverload = <K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
) => void;
export const effectEventListener = effectFactory(
    window.addEventListener as _NiceOverload,
    window.removeEventListener as _NiceOverload,
);
