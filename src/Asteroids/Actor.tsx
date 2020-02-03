import React from "react";
import { HookedComponent } from "../lib/hooklib";

export interface ActorProps extends _defaultProps {
    /** x coordinate of the circle */
    x: number;
    /** y coordinate of the circle */
    y: number;
}
class _defaultProps {
    /** colour of circle. */
    colour = "green";
    /** radius of the circle. */
    size = 10;
}
class _Actor extends HookedComponent<ActorProps> {
    public useRender(props: ActorProps) {
        return <circle cx={props.x} cy={props.y} fill={props.colour} r={props.size} />;
    }
}
export const Actor = HookedComponent.finalize(_Actor, new _defaultProps());
export type Actor = _Actor;
