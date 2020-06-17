import React from "react";
import { ObjectKeys, ObjectEntries } from "./util";

/**
 * symbol used for internal rendering function.  mixins for HookCls can override this
 * to call extra hooks or add extra rendering things.
 * @see HookCls[HOC_RENDER] for more details on how to use this.
 */
export const HOC_RENDER = Symbol.for("hookcls.hoc_render");
/**
 * type constrait for DP for default props, ensures that DP has only a subset of keys in P and none extra.
 */
type DefaultProps<P, DP> = (P | Pick<P, keyof P & keyof DP>) &
    Record<Exclude<keyof DP, keyof P>, never>;
/**
 * interface for relevent fields made by subclasses. Used to infer generics in createComponent method.
 */
interface HCClass<P, DP extends DefaultProps<P, DP> = {}, Inst extends HookCls<P> = HookCls<P>> {
    new (): HookCls<P> & Inst;
    /** default props for component */
    defaultProps?: DP;
    /** class may define a custom name to show in react debugging instead of just the class name */
    displayName?: string;
}
interface PrivateHookClsProto<P> extends HookCls<P> {
    /**
     * THIS ONLY EXISTS ON PROTOTYPES
     * fields labeled with RenderAffecting. Each subclass that uses the the
     * RenderAffecting decorator at least once will be given it's own copy of this array
     * and will be updated with all fields decorated.
     *
     * note that this is NOT (keyof this)[] because that would not allow private fields to be RenderAffecting
     */
    _renderAffectingFields: (keyof any)[];
    /**
     * THIS ONLY EXISTS ON PROTOTYPES
     * when some fields in the subclass are labeled with RenderAffecting then
     * this is defined on the prototype to be a proxy handle to trigger updates.
     * The constructor will return a proxy if this exists
     *  (which exists only if there is at least one RenderAffecting field)
     */
    _proxyHandle?: ProxyHandler<HookCls<any>>;
}
export abstract class HookCls<P = {}> {
    /** class may define a custom name to show in react debugging instead of just the class name */
    public static displayName?: string;
    /** default props for component, note that this field can't be typechecked but createComponent does verify it is valid. */
    public static defaultProps?: {};
    /**
     * Main rendering for react component - is used like any other function component.
     * @param props props for react component
     */
    protected abstract useRender(props: P): React.ReactElement<any, any> | null;

    constructor() {
        this._COMP = (props: P) => {
            return this.useRender(props);
        };
        this._COMP.displayName = new.target.displayName ?? new.target.name;
        const _proxyHandle = ((this as unknown) as PrivateHookClsProto<P>)._proxyHandle;
        if (_proxyHandle !== undefined) {
            return new Proxy(this, _proxyHandle);
        }
    }
    /** internal rendering function component. see description on this[HOC_RENDER] for more info */
    private _COMP: React.FunctionComponent<P>;
    /**
     * The rendering scheme for HookCls is as follows:
     * - createComponent creates a forward ref component which handles
     *    - creating the instance and exposing it via forward ref
     *    - calling inst[HOC_RENDER](props) directly in the forward ref
     * - HOC_RENDER is responsible for intermediate handling like:
     *    - extra hooks like for _force_update or custom HOCs applied
     *    - returns <this._COMP {...props}/>
     *       - HOCs could wrap that in other react stuff if needed.
     * - this._COMP calls this.useRender(props) directly
     *
     * With this architecture each HookCls always has 2 layers, this way the internal hooks
     * needed to make the class run properly are shown in the debugger seperately
     * from the hooks called in useRender. This is useful for debugging purposes.
     *
     * the expectation is that if any mixins for the HookCls are made they do most of
     * their heavy lifting inside this method to keep the interface for useRender very clean.
     *
     * @param props props for component
     */
    protected [HOC_RENDER](props: P) {
        // force update just needs to make a new object by identity each time.
        this._force_update = React.useReducer(() => ({}), this)[1];
        return <this._COMP {...props} />;
    }
    /**
     * forces component to rerender. generally not recommended, the HookCls.RenderAffecting decorator fits most use cases.
     * This is called internally by RenderAffecting code, so tampering with it will likely break that.
     */
    protected _force_update = (): void => undefined; // if this is called before the first render then do nothing.
    /**
     * creates a valid react component for the HookCls.
     * @param this subclass of HookCls
     */
    public static createComponent<Inst extends HookCls<P>, P, DP extends DefaultProps<P, DP>>(
        this: HCClass<P, DP, Inst>,
    ) {
        const comp = React.forwardRef<Inst, P>((props, ref) => {
            const instRef = React.useRef<Inst>();
            const inst = instRef.current ?? (instRef.current = new this());
            React.useImperativeHandle(ref, () => inst, [inst]);
            return inst[HOC_RENDER](props);
        });
        comp.displayName = `HookCls(${this.displayName ?? this.name})`;
        comp.defaultProps = this.defaultProps;
        return comp as typeof comp & { defaultProps: DP };
    }
    /// RENDER AFFECTING

    /**
     * use this as a decorator on fields that should trigger a react update when updated.
     * This provides different behaviour from React.useState, when you assign the field to a new value
     * it is visible immidiately, and this._force_update() is called for you.
     * Note that it won't trigger a react update if (newVal === oldVal)
     */
    protected static RenderAffecting(_proto: HookCls<any>, field: keyof any) {
        const proto = _proto as PrivateHookClsProto<any>;
        // note that field must be (keyof any) to let this be used on private fields.
        if (!proto.hasOwnProperty("_renderAffectingFields")) {
            // subclass doesn't have it's own list so we need to create a new one for it.
            // by spreading the properties from the above prototype we ensure several subclasses don't break.
            const renFields = (proto._renderAffectingFields = [...proto._renderAffectingFields]);
            proto._proxyHandle = {
                set(target, field: keyof typeof target, value, rec) {
                    const do_update = renFields.includes(field) && value !== target[field];
                    const result = Reflect.set(target, field, value, rec);
                    if (do_update) {
                        target._force_update();
                    }
                    return result;
                },
            };
        }
        proto._renderAffectingFields.push(field);
    }
    ////// STATEFUL REDUCERS
    /**
     * creates a subclass of HookCls with extra fields automatically generated
     * based on mapping passed.
     * Note that the fields
     * @param map mapping of values and reducers
     */
    public static WithReducers<P, A>(
        this: typeof HookCls,
        stateAndReducerSpec: A & { [K in keyof P]: ReducerSpec<P[K]> },
    ) {
        type Updaters = UnionToIntersection<{ [K in keyof A]: ExtractUpdaters<A[K]> }[keyof A]>;
        type AddedFields = P & Updaters;
        const map = Object.freeze(stateAndReducerSpec);
        abstract class Wrapped<Props = {}> extends this<Props> {
            private _reducer_store = {} as P; // constructor fills in the values.
            /**
             * map of underlying setstate dispatches. we will always call with the function syntax so we only declare that format.
             * This is filled in the first render, if updates are called before
             */
            private _reducer_updaters: {
                [K in keyof P]?: (update: (s: P[K]) => P[K]) => void;
            } = {};
            constructor() {
                super();
                // TODO: there are a lot of type assertions in this code, pretty sure there should be a way to
                // redo the types above so these aren't necessary but the types got confusing enough to work with
                // (specifically the hack of doing A & {..} so that inference works correctly should probably be fixed)
                const self = this as Updaters;
                for (const [field, { initial, updaters }] of ObjectEntries(map)) {
                    this._reducer_store[field as keyof P] = initial as P[keyof P];
                    for (const [updaterName, updater] of ObjectEntries(updaters)) {
                        self[updaterName as keyof Updaters] = (((...args: never[]) => {
                            const dispatch = this._reducer_updaters[field as keyof P];
                            if (dispatch !== undefined) {
                                dispatch(v => updater(v as any, ...args) as P[keyof P]);
                            } else {
                                // called updater before first render (almost certainly in the constructor)
                                // technically we could just override _reducer_store field directly but
                                // I'd rather just not allow this since attempts to do so is likely a mistake anyway.
                                throw new Error("dispatched action before first render.");
                            }
                        }) as unknown) as Updaters[keyof Updaters];
                    }
                }
            }
            protected [HOC_RENDER](props: Props) {
                const s = this._reducer_store;
                const u = this._reducer_updaters;
                for (const field of ObjectKeys(map) as (keyof P)[]) {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    [s[field], u[field]] = React.useState(s[field]);
                }
                return super[HOC_RENDER](props);
            }
        }
        const proto = Wrapped.prototype as Wrapped<any> & AddedFields;
        for (const field of Object.keys(map) as (keyof P)[]) {
            Object.defineProperty(proto, field, {
                get() {
                    return this._reducer_store[field];
                },
            });
        }
        return (Wrapped as unknown) as Pick<typeof Wrapped, any> & {
            new <P = {}>(): Wrapped<P> & Readonly<AddedFields>;
        };
    }
}
// _renderAffectingFields will always have some elements, simplifies logic inside a little
(HookCls.prototype as PrivateHookClsProto<any>)._renderAffectingFields = [];

type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends (k: infer I) => void
    ? I
    : never;

interface ReducerSpec<T> {
    initial: T;
    /**
     * mapping of reducers for updating the variable. usually there is only 1.
     * arguments to the updater will have the type default to never so explicit type annotation is needed.
     */
    updaters: Record<string, (val: T, ...args: never[]) => T>;
}
type ExtractUpdaters<A> = A extends { updaters: infer U }
    ? {
          [K in keyof U]: U[K] extends (v: any, ...args: infer A) => any
              ? (...args: A) => void
              : unknown;
      }
    : never;

// const _BASE = HookCls.WithReducers({
//     /** count here */
//     count: {
//         initial: 0,
//         updaters: {
//             /** DOC? */
//             increment: c => c + 1,
//             decrement: c => c - 1,
//         },
//     },
// });
// class Counter extends _BASE {
//     protected useRender() {
//         return (
//             <div>
//                 <p>{this.count}</p>
//                 <button onClick={this.increment}>+</button>
//                 <button onClick={this.decrement}>-</button>
//             </div>
//         );
//     }
// }
