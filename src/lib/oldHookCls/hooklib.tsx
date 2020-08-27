import React from "react";

/** symbol to use for internal component which seperates HOC and own rendering. */
const INTERNAL_COMP = Symbol.for("hooklib.render");
/**
 * extracts the instance type from a forward ref function.
 * This is intended to be used with the return type of HookCls.reactify so the
 * class can be written directly inside reactify without losing the type reference. Expected use is like this:
 * ```typescript
 * export type MYCOMPONENT = ExtractInst<typeof MYCOMPONENT>;
 * export const MYCOMPONENT = HookCls.reactify(defaultProps,
 *     class MYCOMPONENT extends HookCls<Props> {
 *         // class body here
 * });
 * ```
 */
export type ExtractInst<
    F extends (
        props: Parameters<F>[0] extends { ref?: React.Ref<any> }
            ? Parameters<F>[0]
            : { ref?: React.Ref<any> },
    ) => any
> = F extends (props: infer P) => any
    ? P extends { ref?: React.Ref<infer Inst> }
        ? Inst
        : never
    : never;
type OutwardProps<P, DP extends { [K in keyof DP & keyof P]: P[K] }> = DP extends P
    ? Partial<P>
    : keyof DP extends never
    ? P
    : Omit<P, keyof DP> & Partial<Pick<P, keyof DP & keyof P>>;
/**
 * TODO: document this
 */
export abstract class HookCls<P> {
    /**
     * renders this component, is allowed to use hooks like a function component.
     * @param props props for component
     */
    protected abstract useRender(props: P): React.ReactElement | null;
    /**
     * function component that just calls this.useRender. Possibly React.memo of that.
     * @see this[INTERNAL_COMP] for details on how this fits into hookcls model
     */
    private _COMP: React.NamedExoticComponent<P> | React.FunctionComponent<P>;
    /**
     * HookCls is normally only constructed inside .reactify construct, in this case it is always called
     * without any arguments.  However if subclasses use a generic for the props reactify loses some
     * type safety since it will only forward the generic if the generic is used somewhere in the constructor arguments.
     * @param NOT_PASSED only present so that generic subclasses retain generic
     */
    public constructor(NOT_PASSED?: P) {
        this._COMP = (props: P) => {
            return this.useRender(props);
        };
        this._COMP.displayName = new.target.displayName ?? new.target.name;
        // handle proxy for RenderAffecting case.
        const handler = this._proxyHandle;
        if (handler) {
            return new Proxy(this, handler);
        }
    }
    /**
     * calling this will request a react update.
     * This is what is called internally when a field labeled with RenderAffecting is changed
     * so if this is overriden it may break RenderAffecting decorator.
     */
    protected _force_update = (): void => undefined;
    /**
     * internal render for HOCs.
     * - finalize creates a React.forwardRef which will keep an instance reference and call this directly
     * - this then calls any hooks as part of HOCs (and _force_update etc.) and returns <this._COMP/>
     * - this._COMP is a function which only returns this.useRender
     *
     * With this architecture we see 2 layers in the debugger for all HookCls components:
     * 1 top one looks like HOC with forward ref and hooks for _force_update etc.
     * 2 component that only uses hooks from useRender
     */
    protected [INTERNAL_COMP](props: P) {
        // useReducer twill just call Object() to make a new object by identity.
        // not sure if this is optimal for performance or if number incrementing would be better.
        this._force_update = React.useReducer(Object, undefined)[1];
        return <this._COMP {...props} />;
    }
    /**
     * takes a subclass of HookCls and returns a valid react component to render it.
     * @param defaultProps default props to use.
     * @param Cls HookCls subclass
     */
    public static reactify<
        Inst extends HookCls<any>,
        P extends Inst extends HookCls<infer pp> ? pp : never,
        DP extends P | { [K in keyof DP & keyof P]: P[K] }
    >(defaultProps: DP, Cls: new (NOT_PASSED?: P) => Inst) {
        const result = React.forwardRef<Inst, P>((props, ref) => {
            const instRef = React.useRef<Inst>();
            const inst = instRef.current ?? (instRef.current = new Cls());
            React.useImperativeHandle(ref, () => inst, [inst]);

            return inst[INTERNAL_COMP](props);
        });
        result.displayName = `HookCls(${(Cls as any).displayName ?? Cls.name})`;
        result.defaultProps = defaultProps as any;
        // type OutwardProps = DP extends P
        //     ? Partial<P>
        //     : keyof DP extends never
        //     ? P
        //     : Omit<P, keyof DP> & Partial<Pick<P, keyof DP>>;
        return (result as unknown) as (
            props: OutwardProps<P, DP> & { ref?: React.Ref<Inst> },
        ) => React.ReactElement | null;
    }
    /// RENDER AFFECTING
    /**
     * THIS ONLY EXISTS ON PROTOTYPES
     * fields labeled with RenderAffecting. Each subclass that uses the the
     * RenderAffecting decorator at least once will be given it's own copy of this array
     * and will be updated with all fields decorated.
     */
    private _renderAffectingFields!: (keyof any)[];
    /**
     * when some fields in the subclass are labeled with RenderAffecting then
     * we use a proxy returned by the constructor to implement the updating.
     * This is the handler set on the subclass when it defines the first RenderAffecting field
     * so in the constructor if this exists on new.target then we need a proxy with this as handler.
     */
    private _proxyHandle?: ProxyHandler<any>;
    /**
     * Use this as a decorator on fields that should trigger a react update when set to a new value.
     */
    protected static RenderAffecting<V = any>(diff?: (prev: V, next: V) => boolean) {
        if (diff) {
            throw new Error("diff feature not implemented");
        }
        return function <F extends keyof any>(proto: HookCls<any> & { [k in F]: V }, field: F) {
            if (Object.getOwnPropertyDescriptor(proto, "renderAffectingFields") === undefined) {
                proto._renderAffectingFields = [...proto._renderAffectingFields];
                proto._proxyHandle = {
                    set(target, field, value, rec) {
                        const result = Reflect.set(target, field, value, rec);
                        if (proto._renderAffectingFields.includes(field)) {
                            target._force_update();
                        }
                        return result;
                    },
                };
            }
            proto._renderAffectingFields.push(field);
        };
    }
    ///
    /**
     * display name of component, may be defined on subclasses.
     * (this needs to exist for typescript to let `new.target.displayName` compile in the constructor)
     * */
    public static displayName?: string;
}
// need to break some type safety here to get the private field to exist on the prototype
(HookCls.prototype as any)._renderAffectingFields = [];

// if(false){ // TEST CODE
//     type Check = ExtractInst<(props: { ref?: number }) => null>;
//     interface Props<T> {
//         a: string;
//         b: T;
//     }
//     class Test<T> extends HookCls<Props<T>> {
//         // private st: string;
//         // constructor(){
//         //     super();
//         //     this.st = "hi"
//         // }
//         protected useRender(props: Props<T>) {
//             return null;
//         }
//     }
//     const XX = HookCls.reactify({ a: "" }, Test);
//     const ref = React.createRef<Test<number>>();
//     const x = <XX b={1} ref={ref}/>
// }
