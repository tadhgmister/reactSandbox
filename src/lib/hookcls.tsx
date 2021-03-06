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
     * fields that are initialized with a hook, meaning they need to be called every render
     */
    _hookInitInitHooks: Record<keyof any, () => any>;
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
        // COMP needs to bind to the proxy if we use a proxy, otherwise RenderAffecting is nearly useless
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let _this = this;
        this._COMP = (props: P) => {
            return _this.useRender(props);
        };
        this._COMP.displayName = new.target.displayName ?? new.target.name;
        const _proxyHandle = ((this as unknown) as PrivateHookClsProto<P>)._proxyHandle;
        if (_proxyHandle !== undefined) {
            _this = new Proxy(this, _proxyHandle);
            return _this;
        }
    }
    /** internal rendering function component. see description on this[HOC_RENDER] for more info */
    private readonly _COMP: React.FunctionComponent<P>;
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
        const hooks = ((this as unknown) as PrivateHookClsProto<P>)._hookInitInitHooks;
        const innerFields = this._hookInitManagedFields;
        // this calls all hooks that were initialized by using HookInit
        for (const field in hooks) {
            if (Object.prototype.hasOwnProperty.call(hooks, field)) {
                innerFields[field] = hooks[field]();
            }
        }
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
        comp.defaultProps = this.defaultProps as any;
        // using typeof comp & {defaultProps: DP} leaves the Partial<P> for default props from forward ref component
        // which breaks the whole default props system, instead we will just explicitly give type that doesn't behave badly.
        // if typescript JSX had a better way to handle props this wouldn't be as complicated...
        return comp as React.NamedExoticComponent<
            P & React.RefAttributes<Inst> & { children?: React.ReactNode }
        > & {
            defaultProps: DP;
        };
    }
    /// RENDER AFFECTING

    /**
     * use this as a decorator on fields that should trigger a react update when updated.
     * This provides different behaviour from React.useState, when you assign the field to a new value
     * it is visible immidiately, and this._force_update() is called for you.
     * Note that it won't trigger a react update if (newVal === oldVal)
     */
    protected static readonly RenderAffecting = (_proto: HookCls<any>, field: keyof any) => {
        const proto = _proto as PrivateHookClsProto<any>;
        // note that field must be (keyof any) to let this be used on private fields.
        if (!Object.prototype.hasOwnProperty.call(proto, "_renderAffectingFields")) {
            // subclass doesn't have it's own list so we need to create a new one for it.
            // by spreading the properties from the above prototype we ensure several subclasses don't break.
            const renFields = (proto._renderAffectingFields = [...proto._renderAffectingFields]);
            proto._proxyHandle = {
                set(target, key: keyof typeof target, value, rec) {
                    const do_update = renFields.includes(key) && value !== target[key];
                    const success = Reflect.set(target, key, value, rec);
                    if (success && do_update) {
                        target._force_update();
                    }
                    return success;
                },
            };
        }
        proto._renderAffectingFields.push(field);
    };
    private readonly _hookInitManagedFields: Record<any, any> = {};
    /**
     * highly experimental decorator for properties which are just result of a hook call every render.
     * this is using legacy decorator stuff that isn't even type safe so browser compatibility is completely con
     */
    protected static HookInit = (
        _proto: HookCls<any>,
        field: keyof any,
        desc?: PropertyDescriptor & { initializer?: () => any },
    ) => {
        const proto = _proto as PrivateHookClsProto<any>;
        if (desc?.initializer === undefined) {
            throw new Error("HookInit only works when descriptor has initializer property");
        }
        // this is some kind of hook call that needs to be called every render
        // we need to return a new decorator that just reads an internal value
        const hookToCall = desc.initializer;
        // if this is the first HookInit property we need to create the new mapping on this prototype
        if (!Object.prototype.hasOwnProperty.call(proto, "_HookInitFields")) {
            // copy any that might exist in super class so multiple subclasses don't break
            proto._hookInitInitHooks = { ...proto._hookInitInitHooks };
        }
        proto._hookInitInitHooks[field as any] = hookToCall;
        const newDesc: PropertyDescriptor = {
            enumerable: desc.enumerable,
            configurable: desc.configurable,
            get(this: HookCls<any>): any {
                // no-unsafe-return should be able to see I have explicitly labeled the getter to return any
                // how is this still considered unsafe? Obviously the rule is intended for people who don't want any anywhere
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return this._hookInitManagedFields[field as any];
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return newDesc as any; // typescript forces descriptors to return void or any.
    };
    ////// STATEFUL REDUCERS
    /**
     * creates a subclass of HookCls with extra fields automatically generated
     * based on mapping passed.
     * @param map mapping of values and reducers
     */
    public static WithReducers<P, A>(
        this: typeof HookCls,
        stateAndReducerSpec: A & { [K in keyof P]: ReducerSpec<P[K]> },
    ) {
        type Updaters = UnionToIntersection<{ [K in keyof A]: ExtractUpdaters<A[K]> }[keyof A]>;
        type AddedFields = P & Updaters;
        // this doesn't freeze the reducer maps as well, this is just to ensure that the fields that need
        // to call hooks every render cannot change at runtime.
        const map = Object.freeze(stateAndReducerSpec);
        abstract class Wrapped<Props = {}> extends this<Props> {
            // constructor fills in the values.
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            private readonly _reducer_store = {} as P;
            /**
             * map of underlying setstate dispatches. we will always call with the function syntax so we only declare that format.
             * This is filled in the first render, if updates are called before
             */
            private readonly _reducer_updaters: {
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
                                dispatch((v) => updater(v as any, ...args) as P[keyof P]);
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
                // this is safe for rules of hooks since map is frozen above.
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
                get(): any {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return this._reducer_store[field];
                },
            });
        }
        return (Wrapped as unknown) as Pick<typeof Wrapped, any> &
            (new <P = {}>() => Wrapped<P> & Readonly<AddedFields>);
    }
}
// _renderAffectingFields will always have some elements, simplifies logic inside a little
(HookCls.prototype as PrivateHookClsProto<any>)._renderAffectingFields = [];
(HookCls.prototype as PrivateHookClsProto<any>)._hookInitInitHooks = {};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
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

/*
USE CASE NEEDED:
frequently it is wanted for a class field to just be the return of a hook, called each render and is read only everwhere else
it would be desirable for these to be called in the HOC part but not necessary.
the point is that the type should be infered from the hook call but the only way for a property declaration to infer is to 
infer the initial value (one set in constructor) and we really dont want to be calling hooks in constructor.

Method 1:
- have a method like "useHooks" which returns an object which is set as object property?
- only way to easily refer to the return type is to have the function outside class :(
Method 2:
- have some special wrapper syntax like WithReducers (which I don't like very much)]
- would pass function which returns fields to put on object by calling hooks
- issue is that rules of hooks makes it annoying to still check that the function is written correctly since it's an arrow
Method 3:
- use black magic to make a decorator that re-calls the initializer of a property every render
  so that the constructor can do useContext or what ever and those properties will just work
- don't like this at all, very iffy with browser compatibility and rules of hooks get funky.
*/
// const testContext = React.createContext({ v: "hello" });
// class TestComp extends HookCls {
//     @HookCls.HookInit
//     a = React.useContext(testContext);
//     useRender() {
//         return null;
//     }
// }
