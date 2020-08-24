# Design

Each section of the redux state should be a subclass of `ReduxState`, the expectation is to have
a bunch of fields with suitable default values to hold redux store data.
`ReduxState` does support get/set descriptors and methods, although such usage is uncommon.

The store will be an instance of `StoreHelpers`, passed a plain object where each value should be
a `ReduxState` instance, expected syntax should be something like:

```ts
export const store = new StoreHelpers({
    theme: new Theme(), // where Theme is subclass of StoreHelpers
    // etc..
});
```

this `StoreHelpers` object has the method `getState` for direct forwarding to the internal store,
and the method `update` taking a nested partial of the state for an update.

it also has the method `useState` for react components to use specific aspects of the redux state
which relies on the fields being instances of `ReduxState` to keep track of updating react components.

There is also the method `makeAction` which takes field in the global store and a field in that `ReduxState` object,
returning a function which takes a new value for that field and will dispatch the according update in order to update the field and notify any react components dependent.

TODO: will have method `Act` to allow better async behaviour, need to figure out how it will work:

-   would like async functions to be able to dispatch updates, although normal async functions can use `getState` and `store.update()` directly without issue, is any additional aid even needed?

## OLD

-   Declaration of state
-   handling of reducer actions that do direct updates (should be totally hidden from application)
-   initialization of store / creation of reducers
-   dependency management
    -   react component calls hook to get redux state - it registers itself with the store to get updated appropriately
    -   after update relevent components get re-rendered.

Idea:

Have a class to represent a section of redux state

all string fields will represent fields of the redux state, getters would also be allowed and supported.

The class also defines some special fields for handling updates etc, all have symbols as keys so it doesn't overlap with rest of state.

Have a hook (or special case of HookedComponent to give redux data as second argument to useRender) that takes a function to
grab fields from the redux state like:

```typescript
useRedux((state) => ({
    loggedIn: state.Auth.loggedIn,
    // etc.
}));
```

When the hook is first called for a component it will call the conversion with a proxy object in order to determine which fields of redux state
are relied on, Example: if `state.Auth` is a ReduxState object then it records that the component relies on that object.
Then each ReduxState object keeps a list of component references (like functions to tell that component to re-render).

When the redux state is updated, if the update goes to a ReduxState object then it sets a flag that it was updated,
Then after the update a callback goes over each ReduxState object and if it was updated all components that rely on data in it are set to be re-rendered.
