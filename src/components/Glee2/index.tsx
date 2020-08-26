import React from "react";
import { SongIndex } from "./SongIndex";
import { SongPage } from "./SongPage";
import { Route } from "react-router";
import { RelSwitch } from "src/lib/reactUtil";

export function GleeRoute() {
    return (
        <>
            <RelSwitch>
                <Route path="." exact component={SongIndex} />
                <Route path="./:song" component={SongPage} />
                {/* <RelRoute>something went wrong in glee router.</RelRoute> */}
            </RelSwitch>
        </>
    );
}
export default GleeRoute;
