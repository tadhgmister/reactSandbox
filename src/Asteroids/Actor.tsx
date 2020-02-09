import React from "react";
import { HookedComponent } from "../lib/hooklib";
import { HookComp } from "src/lib/hooklib2";

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
export class Actor extends HookComp<ActorProps> {
    public static displayName = "Asteroid";
    defaultProps = new _defaultProps();
    public useRender(props: ActorProps) {
        return <circle cx={props.x} cy={props.y} fill={props.colour} r={props.size} />;
    }
    public static JSX = HookComp.finalize(Actor);
}
// type A = _defaultProps extends Partial<ActorProps> ? "A" : "B";
