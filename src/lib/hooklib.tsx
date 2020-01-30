import * as React from 'react';
import {assert, Record} from './util';
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
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare module HookedComponent {
    /**
     * due to limitations in typescript, if a class generic is not used anywhere in it's constructor parameters
     * then the finalize method can't forward the generic as expected.
     * In order to overcome this we use this as the type of the argument to the constructor so that we can preserve the generic.
     */
    export type INIT_ARG<P> = P & void;
}
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
     * This way externally can do `<MYCOMPONENT.JSX />` to create components.
     * @param Cls HookedComponent class
     * @param defaultProps default props for JSX Component
     */
    public static finalize<
        P, // props defined inside the class. 
        Inst extends HookedComponent<P>, // instance type of given class. This is what {ref} exposes
        DK extends keyof AllProps = never, // DefaultKeys, keys of P that are given default values. When defaultProps is not given this defaults to never.
        AllProps extends P = P // this is to ensure that defaultProps does not have P anywhere in it's type so it cannot affect the inference of P
    >(Cls: new(NEVER_PASSED?: HookedComponent.INIT_ARG<P>)=>Inst, defaultProps?: Pick<AllProps, DK> | AllProps){
        const Comp = React.forwardRef<Inst, P>((props, ref)=>{
            // note we can't do useMemo for instance since that doesn't guarentee semantics.
            const instRef = React.useRef<{inst:Inst, varList: (keyof Inst)[]}>();
            const {inst, varList} = instRef.current ?? (instRef.current = {inst: new Cls(), varList: Object.keys((Cls.prototype as HookedComponent)._magic_var_inits ?? {}) as (keyof Inst)[]});
            React.useImperativeHandle(ref, ()=>inst, [inst]);
            for(const field of varList){
                // eslint-disable-next-line react-hooks/rules-of-hooks
                inst._magic_var_state[field] = React.useState(inst._magic_var_state[field]![0]);
            }
            return inst.useRender(props);
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
     * this is added to the prototype of classes that define at least one magic state variable
     * it just holds the list of state variable names, the order is vital to ensure rules of hooks.
     */
    private _magic_var_inits?: {[K in keyof this]?: ()=>this[K]};
    // /**
    //  * this is added to the prototype of classes that define at least one magic state variable
    //  * the compare functions specified in the declaration of the class are stored here.
    //  */
    // declare private _magic_var_cmps?: Record<string, (a: any, b: any)=>boolean>;
    /**
     * holds magic state variables for each instance.
     * each entry holds the [val, setter] pair returned by React.useState
     */
    private _magic_var_state = (()=>{
        const val: {[K in keyof this]?: [this[K], undefined | ((newVal: this[K])=>void)]} = {};
        const inits = ((this as any).__proto__ as this)._magic_var_inits;
        if(inits === undefined){
            console.log("no magic vars, skipping", this)
            return val;
        }
        for(const field of (Object.keys(inits ?? {}) as (keyof this)[])){
            val[field] = [inits[field]!(), undefined]
        }
        return val;
    })()
    /**
     * @deprecated the get-set behaviour is no longer supported for react state variables.
     * recipe:
     * ```typescript
     * class MYCOMPONENT extends HookedComponent<{}> {
     *     @HookedComponent.stateVar
     *     x = "hello"
     * }
     * ```
     * with the decorator stateVar, updates to the field `this.x` will trigger a react update.
     * Note that to maintain consistency, after setting the state variable reading it back won't reflect the new value until a 
     * react update.
     */
    protected static LegacystateVar<T extends HookedComponent<any>,K extends string & keyof T>(prototype: T, field: K, pdesc?: {initializer?: ()=>T[K], value?: T[K]}){
        // add new initializer
        const inits: typeof prototype._magic_var_inits = (prototype._magic_var_inits ?? (prototype._magic_var_inits = {}));
        inits[field] = pdesc?.initializer ?? (()=>{if(pdesc?.value){return pdesc.value;} else {throw new Error("no value or initializer")}});
        // define the descriptor for the field.
        const descr: PropertyDescriptor = {
            enumerable: true,
            configurable: true,
            get(this:T): T[K]{
                return this._magic_var_state[field]![0]
            },
            set(this: T, newVal: T[K]){
                const dispatch = this._magic_var_state[field]![1];
                if (dispatch !== undefined){
                    // we have rendered at least once, dispatch value
                    dispatch(newVal);
                }else{
                    // haven't rendered yet, update value as normal
                    console.warn("re assigned state var before first render, updating directly.", this, field, newVal);
                    this._magic_var_state[field]![0] = newVal
                }
            }
        }
        // Object.defineProperty(prototype, field, descr);
        return descr as any;
    }
    
}
