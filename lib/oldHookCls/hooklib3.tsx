import React from "react";
import { assert } from "../util";
const FORWARD_REF_TYPE = (React.forwardRef((p, r) => null) as any).$$typeof;
assert(FORWARD_REF_TYPE !== undefined, "forward ref type not determined");

/**
 * symbol used as field in HookCls to store extra arguments generated by HOCs
 */
const HOC_ARGS = Symbol.for("hooklib.HOC_ARGS");
/** symbol to use for internal component which seperates HOC and own rendering. */
const INTERNAL_COMP = Symbol.for("hooklib.render");
export abstract class HookCls<P = {}, F extends (...args: any[]) => null = () => null> {
    /**
     * renders the component
     * @param props props passed from parent
     * @param args extra arguments given by HOC mixins
     */
    abstract useRender(props: P, ...args: Parameters<F>): React.ReactElement | null;
    /** stores list of extra arguments provided by HOCs. */
    private [HOC_ARGS]: Parameters<F> = [] as any;
    /** stores persistent function component to serve as the basis for this.useRender */
    private [INTERNAL_COMP]: (props: Parameters<this["useRender"]>[0]) => React.ReactElement | null;
    constructor() {
        this[INTERNAL_COMP] = props => {
            return this.useRender(props, ...this[HOC_ARGS]);
        };
        // a function component (or class) that may have display name, used twice in next statement.
        type DN = { displayName?: string };
        (this[INTERNAL_COMP] as DN).displayName = (new.target as DN).displayName ?? new.target.name;
    }
    protected _internalHOCrender(props: P, ...args: Parameters<F>) {
        this[HOC_ARGS] = args;
        const C = this[INTERNAL_COMP];
        return <C {...props} />;
    }

    public static finalize<T extends new () => HookCls<any, (...args: any[]) => null>>(Cls: T) {
        (Cls as any).render = HookCls._Render.bind(Cls);
        // TODO: it'd be kind of cool to get the names of all HOCs used that are combined into this layer
        // and display them here, then we'd see all the HOCs in play in debug.
        (Cls as any).render.displayName = `HookCls(${(Cls as any).displayName ?? Cls.name})`;
        return makeObjProxy(Cls) as T & { (props: {}): null };
    }
    private static _Render<Inst extends HookCls<P>, P>(
        this: new () => Inst,
        props: P,
        outerRef?: React.Ref<Inst>,
    ) {
        const ref = React.useRef<Inst>();
        const Inst = ref.current ?? (ref.current = new this());
        React.useImperativeHandle(outerRef, () => Inst, [Inst]);
        return Inst._internalHOCrender(props);
    }
}
Object.defineProperty(HookCls, "$$typeof", {
    value: FORWARD_REF_TYPE,
    enumerable: false,
});

const trapNames = [
    "getPrototypeOf",
    "setPrototypeOf",
    "isExtensible",
    "preventExtensions",
    "getOwnPropertyDescriptor",
    "has",
    "get",
    "set",
    "deleteProperty",
    "defineProperty",
    "enumerate",
    "ownKeys",
    "apply",
    "construct",
] as const;
/**
 * returns a proxy with dummy target and every trap set to treat the passed object as the real target
 * This is so that `typeof proxy` will give object.
 * @param realTarget target of proxy
 */
function makeObjProxy<T>(realTarget: T) {
    const handlers: ProxyHandler<any> = {};
    for (const k of trapNames) {
        handlers[k] = ((a: any, ...args: [any, any, any?]) =>
            Reflect[k](realTarget as any, ...args)) as any;
    }
    return new Proxy({}, handlers) as T;
}