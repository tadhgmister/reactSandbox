import { makeCompSwitch } from "src/lib/reactUtil";
import React from "react";

export const Routes = makeCompSwitch({
    "splash/": React.lazy(() => import("./Splash/App")),
    "demos/": React.lazy(() => import("./Demos/demos")),
    "asteroids/": React.lazy(() => import("./Asteroids/Game")),
    "gleemusic/": React.lazy(() => import("./GLEEEEE/HOOOOME")),
    "match game/": React.lazy(() => import("./Match3/MatchGame")),
});
export default Routes;
