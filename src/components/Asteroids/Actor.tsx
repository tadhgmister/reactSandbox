import React from "react";
import { HookCls } from "src/lib/hookcls";

export const testContext = React.createContext("red");
/** all props for Actor */
interface Actor_AllProps extends Actor_DefProps {
    /** x coordinate of the circle */
    x: number;
    /** y coordinate of the circle */
    y: number;
}
/* eslint-disable @typescript-eslint/explicit-member-accessibility,
@typescript-eslint/no-extraneous-class,@typescript-eslint/no-magic-numbers */
/** props defined with default values. */
class Actor_DefProps {
    /** colour of circle. */
    colour = "green";
    /** radius of the circle. */
    size = 10;
}
/* eslint-enable @typescript-eslint/explicit-member-accessibility, 
@typescript-eslint/no-extraneous-class,@typescript-eslint/no-magic-numbers */
/**
 * Actor in asteroids game, intended to be put in an svg tag
 */
export class Actor_Cls extends HookCls<Actor_AllProps> {
    public static displayName = "Asteroid";
    public static defaultProps = new Actor_DefProps();

    @HookCls.HookInit
    private readonly stroke = React.useContext(testContext);
    protected useRender(props: Actor_AllProps) {
        return (
            <circle
                cx={props.x}
                cy={props.y}
                fill={props.colour}
                r={props.size}
                stroke={this.stroke}
            />
        );
    }
}
/**
 * react component to implement Actor_Cls hook class.
 * @see Actor_Cls for full details
 */
export const Actor = Actor_Cls.createComponent();
/** type is an alias to Actor_Cls so that importing react component also imports ref type */
export type Actor = Actor_Cls;
export default Actor;
/** props for Actor taking into account default props being optional */
export type ActorProps = Omit<Actor_AllProps, keyof Actor_DefProps> & Partial<Actor_AllProps>;
