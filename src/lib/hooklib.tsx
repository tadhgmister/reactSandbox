import * as React from 'react';
import {assert} from './util';
////////// GEN EFFECT



export type GenEffect = Iterator<IArguments | any[] | undefined | void, void | (()=>void)>;


function isValidDependencies(val: any): val is React.DependencyList {
    // REact doesn't officially support IArguments objects but it does support indexing needed
    return (val instanceof Array) || Object.prototype.toString.call( val ) === '[object Arguments]'
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
export function useGenEffect(effect: GenEffect){
    const {value: deps, done} = effect.next()
    assert(!done, "gen effect did not yield dependencies");
    assert(isValidDependencies(deps), "gen effect must yield arguments or a list of dependencies.");
    return React.useEffect(()=>{
        const result = effect.next()
        if(result.done){
            // no second yield, return value may be cleanup function.
            return result.value;
        }
        // otherwise there was a second yield, ensure no data was given
        assert(result.value === undefined, "second yield cannot produce data.");
        return ()=>{
            const final = effect.next();
            assert(final.done, "gen effect did not exit after cleanup.");
            assert(final.value === undefined, "gen effect returned value with 2 yield form which is not allowed.");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
export function makeOwnHook<F extends (...args: any[])=>GenEffect, A extends Parameters<F>>(genCallback: F){
    return function useWrapped(...args: A){
        useGenEffect(genCallback(...args))
    }
}
// TODO: fix makeOwnHook to keep generics? not sure if it is possible but I'd like the eventual hook to just
// have the same call signature as window.addEventListener.
export function* EventListenerEffect<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): GenEffect{
    yield arguments;
    window.addEventListener(type, listener, options);
    yield;
    window.removeEventListener(type, listener, options);
}
export const useEventListener = makeOwnHook(EventListenerEffect);


//////////// HookedComponent
/*
Core idea is that you define a class with a method useRender(props) which is called when the component is rendered.
Then you can do <Cls> in jsx, when the component is first created a new instance is created (so constructor is first time init)
a ref is exposed to the instance the same way as class components do.

In order to facilitate this there are a few hurdles: 1. in order for typescript to determine correct prop types
It uses either the .props field of the instance for classes or the argument for functions.

FEATURES:
- E property
   In order to get JSX typescript to recognize the correct props we need a fake object
  - related, the thing passed to JSX should be interpreted as a REF_FORWARDING component.
  so we define a static getter E which we tell typescript gives a function taking the expected prop types.
  but actually returns something that react will use for ref forwarding and handles the main handling of the instance.
- DEFAULT PROPS
  These are the requirements for the props to work correctly:
  - an interface specifying all props as seen inside the class should be define-able
  - the specification of default props should be automatically constrained to force a subset of keys in Props
     and all valid values of props
  - the outward facing props argument should be Omit<Props, keyof DefaultProps> & Partial<Pick<Props, keyof DefaultProps>>
    so that props that are required inside but have defaults are optional on the outside.
  - If the class specifies generics, the type given to the psuedo property E should ideally account for that.
- RENDER AFFECTING VARIABLES
  these are instance variables that when updated should trigger a re-render.  For optimization the function that triggers a re-render will
  be shared with the state that keeps track of async data.
  - stored in internal structure, initializer given by descriptor should still be called on initialization.
  - setter should just check if new value is not equal by identity to the old value, if different call dispatch to request update
  - updater function should be piggybacked off of async data, so if component isn't loaded yet it doesn't trigger render.
  - which fields are relevent is only needed internally, decorator is enough to make the variable and some type safety will be compremised on the inside.
- STATE VAR
  instance field that is read only, then a common updater function is provided to take the field (as a string)
  and the new value (or for reducer, the updater value) to update the field.  then the field is only updated during renders
  - initializer and reducer function stored as pair in prototype
  - value and dispatch stored together in instace
  - getter retrieves from instance field, no setter.
  - updateState calls the dispatch stored in instance.
  - types need to be known externally, the type of the reducer for each field needs to be known ahead of time.
  --- HOW TO TRACK VALID TYPES?
- ASYNC DATA WAIT
  It would be possible to initialize the HookedComponent instance, but before ever rendering it get some async data
  this would allow for this flow:
  - another method that can be overriden like "async getPrerequisiteData()"
  - if the method is defined, after initializing the instance that method is called
  - until the method returns, instance.useRender is never called, without messing up hook order
  - until the method returns the component essentially resolves to a unfinished REact.lazy
  - after the method returns the component gets it's .useRender used normally.
  This would allow for a HookedComponent to turn itself into a lazy without needing to run all hooks for intermidiate 
  updates that may occur before the async finishes.
*/

const REQUEST_UPDATE = Symbol.for("hooklib.REQUEST_UPDATE");
type REQUEST_UPDATE = typeof REQUEST_UPDATE
const InternaluseRender = Symbol.for("hooklib.InternalUseRender");
/**
 * TODO: need to fill in description here
 * 
 * TEMPLATE:
 * interface MYCOMPONENTProps {
 *     // all props that are defined inside the component defined here.
 * }
 * class MYCOMPONENT extends HookedComponent<MYCOMPONENTProps> {
 *     public static JSX = HookedComponent.finalize(MYCOMPONENT, {
 *         // default props here
 *     })
 *     useRender(props: MYCOMPONENTProps){
 *         // normal render stuff here, including hooks.
 *     }
 * }
 * 
 * Note that if a constructor is 
 */
export abstract class HookedComponent<Props = React.PropsWithChildren<{}>> {
    /**
     * The constructor to HookedComponent will always be called with no arguments.
     * due to restrictions in typescript, the only way for the finalize function to work correctly the generic type must be present in the
     * constructor arguments. So subclasses that define a constructor may just call `super()` but need to declare the argument as
     * ```constructor(A?: HookedComponent.INIT_ARG<P>){}``` where P is the props type.
     * @param NEVER_PASSED this must be type HookedComponent.INIT_ARG<P> for compatibility but will never be passed.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(NEVER_PASSED?: HookedComponent.INIT_ARG<Props>){}
    /**
     * called for each render, the component returned by HookedComponent.finalize ensures 
     * this is always called within a valid function component so this is allowed to use hooks.
     * @param props props passed to component.
     */
    protected abstract useRender(props: Props): React.ReactElement | null;
    /**
     * This is an intermediate step for rendering, it should always end with `return this.useRender(props)`
     * This allows for libraries to call extra hooks before passing to main class rendering.
     * If this is overriden the class should probably keep useRender as abstract.
     * @param props props passed to component.
     */
    protected [InternaluseRender](props: Props){
        return this.useRender(props)
    }
    /**
     * Returns a valid react component to use the HookedComponent class.
     * By convention your class should define a static field called "JSX" like so:
     * ```typescript
     * class MYCOMPONENT extends HookedComponent<PROPS> {
     *     public static JSX = HookedComponent.finalize(MYCOMPONENT, {
     *         // default props here.
     *     });
     *     // rest of class.
     * }
     * ```
     * This way externally can do `<MYCOMPONENT.JSX />` to create components, or `export default MYCOMPONENT.JSX`
     * @param Cls HookedComponent class
     * @param defaultProps default props for JSX Component
     */
    protected static finalize<
        P, // props defined inside the class. 
        Inst extends HookedComponent<P>, // instance type of given class. This is what {ref} exposes
        DK extends keyof AllProps = never, // DefaultKeys, keys of P that are given default values. When defaultProps is not given this defaults to never.
        AllProps extends P = P // this is to ensure that defaultProps does not have P anywhere in it's type so it cannot affect the inference of P
    >(Cls: new(NEVER_PASSED?: HookedComponent.INIT_ARG<P>)=>Inst, defaultProps?: Pick<AllProps, DK> | AllProps){
        const Comp = React.forwardRef<Inst, P>((props, ref)=>{
            
            // note we can't do useMemo for instance since that doesn't guarentee semantics.
            const instRef = React.useRef<Inst>();
            const inst = instRef.current ?? (instRef.current = new Cls());
            inst._request_update = React.useReducer((s: {}, arg: REQUEST_UPDATE)=>{
                return {};
            }, {})[1]
            React.useImperativeHandle(ref, ()=>inst, [inst]);
            return inst[InternaluseRender](props);
        })
        Comp.defaultProps = defaultProps as Partial<React.PropsWithoutRef<P>>;
        Comp.displayName = Cls.name;
        // type of props that are visible from the outside, note that inside the function props will always have all the needed
        // props because react will insert them from Component.defaultProps. Part of finalize's job is to ensure that consistency.
        type ExternProps = Omit<P, DK> & Partial<P> & {ref?: React.Ref<Inst>};
        // the only way for the generics forwarding to work correctly is for the return to be treated as a basic function type
        // also the way defaultProps are implemented don't allow for different types inside and outside the component
        // so this takes care of that too.
        return Comp as any as (props: ExternProps) => React.ReactElement;
    }
    /**
     * this is set on the instance by the component created by finalize.
     */
    private _request_update?: (arg: REQUEST_UPDATE)=>void;
    /**
     * this is set on the prototype containing the initializers for all render affecting properties.
     */
    private _render_affecting_inits?: {[K in keyof this]?: ()=> this[K]}
    /**
     * this stores the variables that are labeled @RenderAffecting. 
     */
    private _render_affecting_internal_store = (()=>{
        const store: Partial<this> = {}
        // TODO: adding `?? {}` at the end of this invalidates the type of inits and we can't easily explciitly refer to
        // the type of this._render_affecting_inits, so instead we are doing `?? {}` in the loop below then using ! inside
        const inits = this._render_affecting_inits ?? ((this as any).__proto__ as this)._render_affecting_inits
        for(const field of Object.keys(inits ?? {}) as (keyof this)[]){
            // first ! is because of issue above, second is because all inits with keys will have valid entries.
            store[field] = inits![field]!();
        }
        return store;
    })();
    /**
     * use this as a decorator on instance variables that rendering depends on.
     * it will detect when the variable is updated and trigger a re-render accordingly.
     */
    protected static RenderAffecting<T extends HookedComponent<any>, K extends keyof T>(proto: T, field: K, d?: {initializer?():T[K]}){
        assert(d !== undefined && d.initializer !== undefined, "renderAffecting decorator relies on the 3rd argument having an initializer.")
        let inits = proto._render_affecting_inits;
        if(inits === undefined){
            inits = (proto._render_affecting_inits = {})
        }
        inits[field] = d.initializer;
        const desc: PropertyDescriptor = {
            get(this: T): T[K]{
                return this._render_affecting_internal_store[field]!
            },
            set(this: T, newVal: T[K]){
                if(this._render_affecting_internal_store[field] !== newVal){
                    // _request_update is known to always exist, will need to fix once I can just declare it exists instead of making it optional.
                    this._request_update!(REQUEST_UPDATE)
                }
                this._render_affecting_internal_store[field] = newVal;
            }
        }
        return desc as any;
    }
}
// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export declare module HookedComponent {
    /**
     * due to limitations in typescript, if a class generic is not used anywhere in it's constructor parameters
     * then the finalize method can't forward the generic as expected.
     * In order to overcome this we use this as the type of the argument to the constructor so that we can preserve the generic.
     */
    export type INIT_ARG<P> = P & void;
}
/**
 * if this is passed to useReducer it would completely mimic the behaviour of useState.
 * 
 * @param curr current state
 * @param arg new state or function to mutate state.
 */
function defaultReducer<T>(curr: T, arg: T | ((prev: T)=> T)){
    return typeof arg === "function" ? (arg as (prev: T)=> T)(curr) : arg;
}
/**
 * creates a subclass of HookedComponent which defines several readonly properties and a method `updateState`
 * The behaviour is that when the object is constructed each field specified in `initialState` is effectively copied to the new instance
 * - note that if initialState defines some getter properties they will be computed for each instance
 * Then in order to update the field you must call `.updateState` with the name of the field and the new value.
 * By default the argument to updateState follows same behaviour as useState - either the new value or if the new value depends on the
 * current value instead a function to update the value.  If different behaviour is desired a second mapping for custom reducers can be specified.
 * @param initialState initial state, may define getters for properties that should be computed per instance
 * @param reducers custom reducers, if a field has no reducer specified it defaults to same as setState behaviour
 */
export function statefulHookedComponent<State, Reducers extends {[K in keyof State]?: (prev: State[K], arg: any)=>State[K]}>(initialState: State, reducers?: Reducers) {
    const fields = Object.keys(initialState) as (keyof State)[];
    type Arg<K extends keyof State> = Reducers[K] extends (prev: State[K], arg: infer A)=>State[K] ? A : State[K] | ((prev: State[K])=>State[K])
    abstract class Stateful<P> extends HookedComponent<P> {
        /**
         * updates a ReactState field TODO: more description here.
         * @param k field to update
         * @param arg new value or argument to corresponding reducer
         */
        protected updateState<K extends keyof State>(k: K, arg: Arg<K>){
            const dispatch = this._stateful_internal[k][1];
            assert(dispatch !== undefined, "updateState called before first render.")
            dispatch(arg)
        }
        protected [InternaluseRender](props: P){
            // ignoring rule of hooks since the order of calls is ensured by defining fields outside the class, there is no way it will change
            // during the lifetime of a component.
            for(const field of fields){
                const reducer = reducers?.[field] ?? defaultReducer;
                // eslint-disable-next-line react-hooks/rules-of-hooks
                this._stateful_internal[field] = React.useReducer(reducer, this._stateful_internal[field][0]) as any;
            }
            return super[InternaluseRender](props); 
        }
        /**
         * for each state variable contains the pair [v, dispatch] as returned by React.useReducer
         * dispatch is initially undefined, if an update triggers before the first render an error will be thrown.
         */
        private _stateful_internal = (()=>{
            type InternalState = {[K in keyof State]: [State[K], undefined | ((a: Arg<K>)=>void)]}
            const myState: Partial<InternalState> = {}
            for(const field of fields){
                // note that this may trigger getters in the initial state if the property is computed.
                myState[field] = [initialState[field], undefined]
            }
            return myState as InternalState;
        })()
    }
    type SS = Omit<Stateful<any>, "_stateful_internal"> & {_stateful_internal: {[K in keyof State]: [State[K], undefined | ((a: Arg<K>)=>void)]}}
    for(const field of fields){
        Object.defineProperty(Stateful.prototype, field, {
            enumerable: true,
            get(this: SS){
                return this._stateful_internal[field][0]
            }
        })
    }
    return Stateful as unknown as {new<P>(NEVER_PASSED?: HookedComponent.INIT_ARG<P>): Stateful<P> & Readonly<State>}
}
