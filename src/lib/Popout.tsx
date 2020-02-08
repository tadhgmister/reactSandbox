import React from "react";
import { HookedComponent, useGenEffect } from "src/lib/hooklib";
import { assert } from "./util";
import ReactDOM from "react-dom";
import { Stylesheet } from "./reactUtil";
import { geneffs } from "./hooks";
export interface PopoutProps extends _DefaultProps, React.PropsWithChildren<{}> {
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
class _DefaultProps {
    /**
     * title of window and className used when not open in a new window
     */
    name = "popup";
    /**
     * type of tag to use when displaying normally
     */
    Tag: keyof React.ReactHTML = "aside";
}
/**
 * Container that supports popping out the contents into a seperate window.
 * This is useful for side menus or toolbars to float next to the main window.
 * note that in JSX you need to use <Popout.JSX>
 */
export class Popout extends HookedComponent<PopoutProps> {
    private window: Window | null = null;
    @HookedComponent.RenderAffecting
    private bodyElem: HTMLBodyElement | null = null;
    private wWidth: number = 100;
    private wHeight: number = 100;
    public useRender(props: PopoutProps) {
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
    private spawnWindow = () => {
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
    private closeWindow = () => {
        if (this.window === null) return;
        this.window.close();
        this.onClose();
    };
    /** called by the opened window closing, cleans up references */
    private onClose = () => {
        this.window = null;
        this.bodyElem = null;
    };

    /** valid react component for this class, to be used in JSX code. */
    public static JSX: typeof _JSX;
}
const _JSX = HookedComponent.finalize(Popout, new _DefaultProps());
Popout.JSX = _JSX;
export default Popout.JSX;
