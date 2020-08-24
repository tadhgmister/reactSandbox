import { StoreHelpers, ReduxState } from "src/lib/reduxlib";

class Theme extends ReduxState {
    /** background for theme */
    bg: string = "";
}

export const store = new StoreHelpers({
    theme: new Theme(),
});

export default store;
