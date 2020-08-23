// import React from "react";
// import { HookCls } from "src/lib/hookcls";
// import { useGenEffect, geneffs } from "src/lib/hooks";
// import { Stylesheet } from "src/lib/reactUtil";
// import ReactDOM from "react-dom";
// import { assert } from "src/lib/util";
// /** all props for Tile */
// interface Tile_AllProps extends React.PropsWithChildren<Tile_DefProps> {
//     /**
//      * styles applied to container when present in the main window,
//      * or styles applied to body of window when content is moved to the new window
//      */
//     style?: React.CSSProperties;
//     /**
//      * width of the opened window in pixels, most be >= 100
//      */
//     w: number;
//     /**
//      * height of opened window in pixels, must be >=  100
//      */
//     h: number;
// } // required props go in here.
// /** props defined with default values. */
// class Tile_DefProps {
//     /**
//      * title of window and className used when not open in a new window
//      */
//     name = "popup";
//     /**
//      * type of tag to use when displaying normally
//      */
//     Tag: keyof React.ReactHTML = "aside";
// }
// /**
//  * Container that supports popping out the content into a seperate window
//  * this may prove useful for side menus that might want to decide which side of screen etc
//  * or spreading an app over multiple displays if that would be useful.
//  */
// export class Tile_Cls extends HookCls<Tile_AllProps> {
//     public static defaultProps = new Tile_DefProps();
//     private window: Window | null = null;
//     @HookCls.RenderAffecting
//     private falling: boolean | null = null;
//     private wWidth: number = 100;
//     private wHeight: number = 100;

//     protected useRender(props: Tile_AllProps) {
//         this.wWidth = props.w;
//         this.wHeight = props.h;
//         useGenEffect(this.setWindowTitle(props.name));
//         useGenEffect(geneffs.eventListener("unload", this.closeWindow));
//         React.useEffect(() => this.closeWindow, []);
//         return (
//             <props.Tag style={props.style} className={props.name}>
//                 <button onClick={this.spawnWindow}>Move to own window</button>
//                 {props.children}
//             </props.Tag>
//         );
//     }
//     /** updates the spawned window title, if it is open and if the title is given. Nothing is done to change it back. */
//     private *setWindowTitle(title: string | undefined) {
//         yield [this.window, title];
//         if (this.window === null || title === undefined) return;
//         this.window.document.title = title;
//     }
//     private spawnWindow = () => {
//         this.falling = true;
//     };
//     private closeWindow = () => {
//         if (this.window === null) return;
//         this.window.close();
//         this.onClose();
//     };
//     /** called by the opened window closing, cleans up references */
//     private onClose = () => {
//         this.window = null;
//         this.falling = null;
//     };
// }
// /**
//  * react component to implement Tile_Cls hook class.
//  * @see Tile_Cls for full details
//  */
// export const Tile = Tile_Cls.createComponent();
// /** type is an alias to Tile_Cls so that importing react component also imports ref type */
// export type Tile = Tile_Cls;
// export default Tile;
// /** props for Tile taking into account default props being optional */
// export type TileProps = Omit<Tile_AllProps, keyof Tile_DefProps> & Partial<Tile_AllProps>;

import React from "react";
import { HookCls } from "src/lib/hookcls";
/** all props for Tile */
interface Tile_AllProps extends React.PropsWithChildren<Tile_DefProps> {
    x: number;
    y: number;
    del: (x: number, y: number) => void;
} // required props go in here.
/** props defined with default values. */
class Tile_DefProps {
    // props with default values here. remember to document all props
}

/**
 * TODO: DESCRIBE CLASS HERE
 */
export class Tile_Cls extends HookCls<Tile_AllProps> {
    public static defaultProps = new Tile_DefProps();
    @HookCls.RenderAffecting
    private falling = false;
    private prev_y = -1;
    protected useRender(props: Tile_AllProps) {
        if (this.prev_y !== props.y) {
            this.falling = true;
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
            return { animationName: "drop1", animationDuration: "1s" };
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
