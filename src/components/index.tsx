import { makeCompSwitch } from "src/lib/reactUtil";
import React from "react";

export const Routes = makeCompSwitch({
    "/splash/": React.lazy(async () => import("./Splash/App")),
    "/demos/": React.lazy(async () => import("./Demos/demos")),
    "/asteroids/": React.lazy(async () => import("./Asteroids/Game")),
    "/gleemusic/": React.lazy(async () => import("./GLEEEEE/HOOOOME")),
    "/match game/": React.lazy(async () => import("./Match3/MatchGame")),
    "/glee_updated/": React.lazy(async () => import("./Glee2")),
});
export default Routes;
