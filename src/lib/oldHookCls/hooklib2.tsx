import React from "react";
import { assert } from "../util";

const FORWARD_REF_TYPE = (React.forwardRef((p, r) => null) as any).$$typeof;
assert(FORWARD_REF_TYPE !== undefined, "forward ref type not determined");
type A = React.ReactNode;
type NonUndefinedKeys<T> = { [K in keyof T]: T[K] extends undefined ? never : K }[keyof T];
type ResolveProps<
    Inst extends HookComp<any>,
    D = Inst["defaultProps"],
    P = Parameters<Inst["useRender"]>[0]
> = P extends undefined
    ? {}
    : NonUndefinedKeys<D> extends never
    ? P & { ref?: React.Ref<Inst> }
    : Omit<P, NonUndefinedKeys<D>> & Partial<P> & { ref?: React.Ref<Inst> };

export interface HookComp<P = {}> {
    /**
     * NEVER ACTUALLY CALL A HOOK COMPONENT IT WILL FAIL AT RUNTIME
     * This is so that typescript sees the valid component stuff, react treats it seperately
     */
    (props: ResolveProps<this, {}>): React.ReactElement | null;
}
export abstract class HookComp<P = {}> {
    public displayName: string;
    constructor() {
        this.displayName = (new.target as any).displayName ?? new.target.name;
    }
    /** contains default values for props that are optional */
    public defaultProps?: Partial<P>;
    /** renders the component, the argument to this method determine the objects prop types. */
    public abstract useRender(props: P): React.ReactElement | null;
    /**
     * takes a HookComp class with a no argument constructor and returns a valid react component
     * to create a new instance at the location and render it properly.
     */
    public static finalize<Inst extends HookComp>(Cls: new () => Inst) {
        const Comp = React.forwardRef<Inst, ResolveProps<Inst>>((props, ref) => {
            const a = React.useRef<Inst>();
            const Inst: any = a.current ?? (a.current = new Cls());
            return <Inst {...props} ref={ref} />;
        });
        Comp.displayName = `finalize(${(Cls as any).displayName ?? Cls.name})`;
        return Comp;
    }
    /** this is called by react because we make our component look like a  */
    private render = (props: Parameters<this["useRender"]>[0], ref?: React.Ref<this>) => {
        if (this._req_upd_canId) {
            window.clearTimeout(this._req_upd_canId);
            this._req_upd_canId = undefined;
        }
        React.useImperativeHandle(ref, () => this, []);
        const update = React.useReducer(() => ({}), {})[1];
        if (this._request_update === undefined) {
            this._request_update = () => {
                if (this._req_upd_canId !== undefined) {
                    return; // already pending an update
                }
                this._req_upd_canId = window.setTimeout(update, 1);
            };
        }
        return this.useRender(props);
    };
    /**
     * this will request the component to re-render in the near future
     * called internally by RenderAffecting, marked as protected so you can reuse it if needed
     * generally not recommended, using any of standard ways of indicating react to update is prefered.
     */
    protected _request_update?: () => void;
    /**
     * id returned from window.setTimeout, used to manage request update.
     */
    private _req_upd_canId?: number;
    /**
     * this stores the variables that are labeled @RenderAffecting.
     */
    private _render_affecting_internal_store = (() => {
        const store: Partial<this> = {};
        // TODO: adding `?? {}` at the end of this invalidates the type of inits and we can't easily explciitly refer to
        // the type of this._render_affecting_inits, so instead we are doing `?? {}` in the loop below then using ! inside
        const inits = ((this as any).__proto__ as HCproto<this>)._render_affecting_inits;
        for (const field of Object.keys(inits ?? {}) as (keyof this)[]) {
            // first ! is because of issue above, ?. will occur if there is no initializer.
            // the initializer will only be defined if the value is assigned at it's declaration, if it's set in the constructor inits[field] will be null.
            store[field] = inits![field]?.();
        }
        return store;
    })();
    /**
     * use this as a decorator on instance variables that rendering depends on.
     * it will detect when the variable is updated and trigger a re-render accordingly.
     */
    protected static RenderAffecting<T extends HookComp<any>, K extends keyof T>(
        proto: T,
        field: K,
        d?: { initializer?(): T[K] },
    ): any;
    /** since (keyof T) doesn't include private or protected fields, this call signature is needed so that it can be used on non public fields */
    protected static RenderAffecting<T extends HookComp<any>, K extends keyof T>(
        proto: T,
        field: K | string,
        d?: { initializer?(): T[K] },
    ): any;
    protected static RenderAffecting<T extends HookComp<any>, K extends keyof T>(
        proto: HCproto<T>,
        field: K,
        d?: { initializer?(): T[K] },
    ) {
        assert(
            d !== undefined && d.initializer !== undefined,
            "renderAffecting decorator relies on the 3rd argument having an initializer.",
        );
        let inits = proto._render_affecting_inits;
        if (inits === undefined) {
            inits = proto._render_affecting_inits = {};
        }
        inits[field] = d.initializer;
        const desc: PropertyDescriptor = {
            get(this: T): T[K] {
                return this._render_affecting_internal_store[field]!;
            },
            set(this: T, newVal: T[K]) {
                const changed = this._render_affecting_internal_store[field] !== newVal;
                this._render_affecting_internal_store[field] = newVal;
                if (changed) {
                    // if request_update isn't defined yet because we are still in constructor just ignore.
                    this._request_update?.();
                }
            },
        };
        return desc as any;
    }
}
// this makes our component look like a forward ref to react so it will call our render.
Object.defineProperty(HookComp.prototype, "$$typeof", {
    value: FORWARD_REF_TYPE,
    enumerable: false,
});
interface HCproto<T> {
    /**
     * this is set on the prototype containing the initializers for all render affecting properties.
     */
    _render_affecting_inits?: { [K in keyof T]?: () => T[K] };
}
// interface Props1 {
//     a: string;
//     b: string;
// }
// type Props2 = { a: string; b: string };
// class Test extends HookComp {
//     useRender(props: Props1) {
//         return null;
//     }
// }

// const X = new Test();
// const y = <X />;
// type AA = ResolveProps<any, { a: string }, { a: undefined }>;
