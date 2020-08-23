import React from "react";
import { HookCls } from "src/lib/hookcls";
import styles from "./Match3.module.css";
/** all props for Tile */
interface Tile_AllProps extends React.PropsWithChildren<Tile_DefProps> {
    x: number;
    y: number;
    del: (x: number, y: number) => void;
}
/** props defined with default values. */
class Tile_DefProps {}

/**
 * this is a tile in the match 3 game, mostly deals with nice dropping animation,
 * all program logic is handled in MatchGame
 */
export class Tile_Cls extends HookCls<Tile_AllProps> {
    public static defaultProps = new Tile_DefProps();
    @HookCls.RenderAffecting
    private falling = false;
    private prev_y = -1;
    protected useRender(props: Tile_AllProps) {
        if (this.prev_y !== props.y) {
            this.falling = true;
            this.prev_y = props.y;
        }
        return (
            <div
                onClick={() => {
                    props.del(props.x, props.y);
                }}
                onAnimationEnd={() => {
                    this.falling = false;
                }}
                style={this.style}
            >
                {props.children}
            </div>
        );
    }
    get style(): React.CSSProperties {
        if (this.falling) {
            return { animationName: styles.drop1, animationDuration: "1s" };
        } else {
            return {};
        }
    }
}
/**
 * react component to implement Tile_Cls hook class.
 * @see Tile_Cls for full details.
 */
export const Tile = Tile_Cls.createComponent();
/** type is an alias to Tile_Cls so that importing react component also imports ref type */
export type Tile = Tile_Cls;
export default Tile;
/** props for Tile taking into account default props being optional */
export type TileProps = Omit<Tile_AllProps, keyof Tile_DefProps> & Partial<Tile_AllProps>;
