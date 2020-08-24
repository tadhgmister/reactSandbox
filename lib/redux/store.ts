import {StoreHelpers, ReduxState} from "./reduxlib";

class Theme extends ReduxState {
    /** background for theme */
    bg: string = "";
}


export const store = new StoreHelpers({
    theme: new Theme()
})

export default store;