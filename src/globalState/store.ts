import { StoreHelpers, ReduxState } from "src/lib/reduxlib";
// for all "classes" below which are reduxStates, the purpose is to just define
// data types and default values in same construct, so all fields should be public
// we will disable the explcit public for this file.
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

class Theme extends ReduxState {
    /** background for theme */
    bg = "";
}

export const store = new StoreHelpers({
    theme: new Theme(),
});

export default store;
