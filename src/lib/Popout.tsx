import React from "react";
import { HookCls } from "src/lib/hookcls";
import { useGenEffect, geneffs } from "./hooks";
import { Stylesheet } from "./reactUtil";
import ReactDOM from "react-dom";
import { assert } from "./util";
/** all props for Popout */
interface Popout_AllProps extends React.PropsWithChildren<Popout_DefProps> {
    /**
     * styles applied to container when present in the main window,
     * or styles applied to body of window when content is moved to the new window
     */
    style?: React.CSSProperties;
    /**
     * width of the opened window in pixels, most be >= 100
     */
    w: number;
    /**
     * height of opened window in pixels, must be >=  100
     */
    h: number;
}

/* eslint-disable @typescript-eslint/explicit-member-accessibility, 
@typescript-eslint/no-extraneous-class,@typescript-eslint/no-magic-numbers */
/** props defined with default values. */
class Popout_DefProps {
    /**
     * title of window and className used when not open in a new window
     */
    name = "popup";
    /**
     * type of tag to use when displaying normally
     */
    Tag: keyof React.ReactHTML = "aside";
}
/* eslint-enable @typescript-eslint/explicit-member-accessibility, 
@typescript-eslint/no-extraneous-class,@typescript-eslint/no-magic-numbers */
/**
 * the opened window has a minimum size of 100 by 100 pixels,
 * it is required for w and h to be passed via props but if we somehow tried to spawn a window
 * before the props were read then we need some valid value and it only makes sense to use 100.
 */
const MOST_REASONABLE_DEFAULT_FOR_W_AND_H = 100;
/**
 * Container that supports popping out the content into a seperate window
 * this may prove useful for side menus that might want to decide which side of screen etc
 * or spreading an app over multiple displays if that would be useful.
 */
export class Popout_Cls extends HookCls<Popout_AllProps> {
    public static defaultProps = new Popout_DefProps();
    private window: Window | null = null;
    @HookCls.RenderAffecting
    private bodyElem: HTMLBodyElement | null = null;
    private wWidth = MOST_REASONABLE_DEFAULT_FOR_W_AND_H;
    private wHeight = MOST_REASONABLE_DEFAULT_FOR_W_AND_H;
    protected useRender(props: Popout_AllProps) {
        this.wWidth = props.w;
        this.wHeight = props.h;
        useGenEffect(this.setWindowTitle(props.name));
        useGenEffect(geneffs.eventListener("unload", this.closeWindow));
        React.useEffect(() => this.closeWindow, []);
        if (this.bodyElem !== null) {
            const stylesheet =
                props.style === undefined ? null : <Stylesheet styles={{ body: props.style }} />;
            return ReactDOM.createPortal(
                <React.Fragment>
                    {props.children}
                    {stylesheet}
                </React.Fragment>,
                this.bodyElem,
            );
        }
        return (
            <props.Tag style={props.style} className={props.name}>
                <button onClick={this.spawnWindow}>Move to own window</button>
                {props.children}
            </props.Tag>
        );
    }
    /** updates the spawned window title, if it is open and if the title is given. Nothing is done to change it back. */
    private *setWindowTitle(title: string | undefined) {
        yield [this.window, title];
        if (this.window === null || title === undefined) return;
        this.window.document.title = title;
    }
    private readonly spawnWindow = () => {
        // don't do anything if we already have a window
        if (this.window !== null) return;

        this.window = window.open(
            "",
            "",
            `menubar=no,status=no,titlebar=yes,toolbar=no,width=${this.wWidth},height=${this.wHeight}`,
        );
        if (this.window === null) {
            alert("failed to open new window.");
            return;
        }
        // insert div then get reference to it.
        const elems = this.window.document.getElementsByTagName("body");
        this.bodyElem = elems.item(0);
        assert(this.bodyElem !== null, "could not get body from new window.");
        this.window.addEventListener("unload", this.onClose);
    };
    private readonly closeWindow = () => {
        if (this.window === null) return;
        this.window.close();
        this.onClose();
    };
    /** called by the opened window closing, cleans up references */
    private readonly onClose = () => {
        this.window = null;
        this.bodyElem = null;
    };
}
/**
 * react component to implement Popout_Cls hook class.
 * @see Popout_Cls for full details
 */
export const Popout = Popout_Cls.createComponent();
/** type is an alias to Popout_Cls so that importing react component also imports ref type */
export type Popout = Popout_Cls;
export default Popout;
/** props for Popout taking into account default props being optional */
export type PopoutProps = Omit<Popout_AllProps, keyof Popout_DefProps> & Partial<Popout_AllProps>;
