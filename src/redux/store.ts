import { StoreHelpers, ReduxState } from "lib/reduxlib";

class Theme extends ReduxState {
    /** background for theme */
    bg: string = "";
}

export const store = new StoreHelpers({
    theme: new Theme(),
});

export default store;