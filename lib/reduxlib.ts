import * as redux from "redux";
import React from "react";
import { ObjectEntries, isDefined } from "./util";
import ReactDOM from "react-dom";

//// NOTE: initially this will be designed to only take ReduxStore objects into the state
// later once that is working I will adapt it to take other types of state or use nested state as needed.

const _SYMBOL_PEFIX = "tadhgredux.";
const UPDATE = Symbol.for(_SYMBOL_PEFIX + "update");
const INTERNAL = Symbol.for(_SYMBOL_PEFIX + "internal_data");
class InternalData {
    /** indicates whether any updates have occured that still need to be dispatched to update dependents */
    hasChanged = false;
    /** set of callbacks to be called when notifying components */
    dependents = new Set<() => void>();
    /** if hasChanged is true then notifies all dependents and sets hasChanged back to false, does nothing if hasChanged is false. */
    notify_dependents() {
        if (!this.hasChanged) return;
        // TODO: should the hasChanged be set back to false before calling the callbacks or after?
        this.hasChanged = false;
        for (const callback of this.dependents) {
            callback();
        }
    }
}
/**
 * base class for redux state objects,
 * note that as an implementation limitation, updating a field to undefined is treated like not updating it at all
 * so fields should not have undefined as a valid value, use null to indicate it is empty instead.
 * TODO: fill this in more.
 */
export class ReduxState {
    /** keeps record of when this object is updated and who to notify when we have. */
    public readonly [INTERNAL] = new InternalData();
    /**
     * takes a partial state and for each field that is not set to undefined will update own state.
     * If any changes are made the internal hasChanged is set to true. does NOT notify any dependents that change has occured.
     */
    public [UPDATE](updates: Partial<this>) {
        const newFields = ObjectEntries(updates, isDefined);
        if (newFields.length === 0) return;
        // it's possible some assignments will fail if there are get/set properties.
        // we could put the `this[k] = v` in a try to avoid inconsistent update but that
        // seems so unlikely a case, and it's not clear what should be done with the error
        this[INTERNAL].hasChanged = true;
        for (const [k, v] of newFields) {
            this[k] = v;
        }
    }
}
interface UpdateAction<S extends Record<string, ReduxState>> extends redux.Action<"UPDATE"> {
    /**
     * nested partial of state, note that fields set to undefined will just be ignored (treated as no update)
     */
    data: { [K in keyof S]?: Partial<S[K]> };
}
// type ExampleState = {
//     foo: ReduxState & { a: string; b: number };
//     bar: ReduxState & { c: string; d: number };
// };

/**
 * takes an object where each field is a instance of ReduxState
 * returns a valid reducer to pass to the redux store, this reducer only accepts update actions and will delegate them appropriately.
 * @param stateObject initial state
 */
function makeReducer<S extends Record<string, ReduxState>>(stateObject: S) {
    return function reducer(state: S = stateObject, { type, data }: UpdateAction<S>): S {
        if (type !== "UPDATE") {
            if (!(type as string).includes("INIT")) {
                // allow the redux init action,
                console.warn("got unrecognized redux action:", type);
            }
            return state;
        }
        for (const [k, v] of ObjectEntries(data, isDefined)) {
            state[k][UPDATE](v);
        }
        return state;
    };
}
export class StoreHelpers<S extends Record<string, ReduxState>> {
    /** underlying redux store */
    private store: redux.Store<S, UpdateAction<S>>;
    /** indicates if we are in the middle of an update, set by Act callback to only trigger react notification after stable. */
    private midUpdate = false;
    constructor(state: S) {
        this.store = redux.createStore(makeReducer(state));
        this.store.subscribe(this.notify.bind(this));
    }
    /**
     * NOT FULLY IMPLEMENTED
     * intent is to mirror something like Act I designed for EIP but need more consideration,
     * with the non-copying design there isn't a nice way to revert in the middle of a async callback if it throws an error.
     * @deprecated see full note, not implemented correctly and deprecated is best way to label use as issue.
     * @param callback
     */
    public Act<P extends any[], R>(callback: (dispatch: any, getState: () => S, ...args: P) => R) {
        return (...args: P): R => {
            const alreadyUpdating = this.midUpdate;
            this.midUpdate = true;
            let result: R;
            try {
                // TODO: if an error is thrown in the middle we have no way to revert, now I understand the nature of redux to create new copies every time.
                result = callback(0, this.getState, ...args);
            } finally {
                this.midUpdate = alreadyUpdating;
            }
            if (!alreadyUpdating) {
                this.notify();
            }
            return result;
        };
    }
    /** gets the state of the underlying store */
    public getState = () => this.store.getState();
    /** updates the internal state and may trigger some react updates. */
    public update = (s: { [K in keyof S]?: Partial<S[K]> }) => {
        this.store.dispatch({ type: "UPDATE", data: s });
    };
    /** notifies all components that are depending on the redux state to update. */
    private notify() {
        ReactDOM.unstable_batchedUpdates(() => {
            const state = this.getState();
            for (const v of Object.values(state)) {
                v[INTERNAL].notify_dependents();
            }
        });
    }
    public useState<T>(getFields: (state: S) => T): T {
        // need to create a proxy of S to pass into the getFields,
        // then proxy will track which fields were accessed and add a notifier to each one
        const trigger_update = React.useReducer((n) => n + 1, 0)[1];
        const to_unregister: Array<{ delete(a: typeof trigger_update): void }> = [];
        const { proxy, revoke } = Proxy.revocable(this.getState(), {
            get(state, field: keyof S) {
                const result = state[field];
                if (result instanceof ReduxState) {
                    result[INTERNAL].dependents.add(trigger_update);
                    to_unregister.push(result[INTERNAL].dependents);
                }
                return result;
            },
        });
        const result = getFields(proxy);
        revoke();
        // cleanup only, actual computation is done syncronously with getFields(proxy)
        React.useEffect(
            () => () => {
                for (const set of to_unregister) {
                    set.delete(trigger_update);
                }
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            to_unregister,
        );
        return result;
    }
    /**
     * returns a function which takes just the new value for the specified field and will update it
     * note that passing undefined to the callback will not trigger any update.
     * @param k section in state to update
     * @param f field of that section to update
     */
    public makeAction<K extends keyof S, F extends keyof S[K]>(k: K, f: F) {
        return (newVal?: S[K][F]) => {
            this.update({ [k]: { [f]: newVal } } as any);
        };
    }
}

//////////////////////// OLD CODE
//////////////////// Might still be applicable, not sure.

// interface UpdateAction<S extends ReduxState, F extends keyof S = keyof S> extends Action<"UPDATE">{
//     field: F;
//     update: (prev: S[F])=>S[F]
// }
// interface SetAction<S extends ReduxState, F extends keyof S = keyof S> extends Action<"OVERRIDE">{
//     field: F;
//     newVal: S[F];
// }
// type UpdateOrSetAction<S extends ReduxState,F extends keyof S = keyof S> = UpdateAction<S,F> | SetAction<S,F>;
// /**
//  * action that delegates another action to a specific sub field of the global state
//  */
// interface DelegateAction<S, F extends keyof S, A extends (S[F] extends ReduxState ? UpdateOrSetAction<S[F]> : AnyAction)> extends Action<"DELEGATE">{
//     field: F;
//     action: A
// }
// export function Act<Param extends any[], R>(func: (dispatch: any, getState: any, ...param: Param)=>R){
//     return (...param: Param) => (dispatch: any, getState: any) => func(dispatch, getState, ...param);
// }

// const DoThing = Act((dispatch, getState, a: string)=>{
//     return 5 as const
// })
