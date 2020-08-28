import React from "react";

import { geneffs, useGenEffect } from "./hooks";
import { HookedComponent, statefulHookedComponent } from "./oldHookCls/hooklib1";

interface Point {
    x: number;
    y: number;
}

interface Props extends React.PropsWithChildren<{}> {
    bgColour: React.CSSProperties["backgroundColor"];
}
const defaultStyle: React.CSSProperties = {
    minWidth: "30px",
    minHeight: "1em",
};
function updatePos(currPos: Point, ev: KeyboardEvent) {
    let { x, y } = currPos;
    switch (ev.key) {
        case "w":
            y -= 1;
            break;
        case "a":
            x -= 1;
            break;
        case "s":
            y += 1;
            break;
        case "d":
            x += 1;
            break;
        default:
            // unsupported key, just return original position
            return currPos;
    }
    return { x, y };
}

export class ClsComponent extends React.Component<Props, { loc: Point }> {
    // note that no type checking is made available here.
    public static defaultProps = {
        bgColour: "red",
    };
    constructor(initialProps: Props) {
        super(initialProps);
        this.state = {
            loc: { x: 0, y: 0 },
        };
        this.handleKey = this.handleKey.bind(this);
    }
    public render() {
        return (
            <div
                style={{
                    ...defaultStyle,
                    backgroundColor: this.props.bgColour,
                    marginLeft: this.state.loc.x,
                    marginRight: this.state.loc.y,
                }}
            >
                {this.props.children}
            </div>
        );
    }
    public componentDidMount() {
        window.addEventListener("keypress", this.handleKey);
    }
    public componentWillUnmount() {
        window.removeEventListener("keypress", this.handleKey);
    }
    private readonly handleKey = (ev: KeyboardEvent) => {
        this.setState((s) => ({ loc: updatePos(s.loc, ev) }));
    };
}

export function FuncComponent(props: Props) {
    const [loc, handleKey] = React.useReducer(updatePos, { x: 0, y: 0 });
    React.useEffect(() => {
        window.addEventListener("keypress", handleKey);
        return () => {
            window.removeEventListener("keypress", handleKey);
        };
    }, [handleKey]);
    return (
        <div
            style={{
                ...defaultStyle,
                backgroundColor: props.bgColour,
                marginLeft: loc.x,
                marginRight: loc.y,
            }}
        >
            {props.children}
        </div>
    );
}

///////
export class InstVarsComponent extends HookedComponent<Props> {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    @HookedComponent.RenderAffecting
    public loc: Point = { x: 0, y: 0 };

    public handleKey = (ev: KeyboardEvent) => {
        this.loc = updatePos(this.loc, ev);
    };
    public useRender(props: Props) {
        useGenEffect(geneffs.eventListener("keypress", this.handleKey));
        return (
            <div
                style={{
                    ...defaultStyle,
                    backgroundColor: props.bgColour,
                    marginLeft: this.loc.x,
                    marginRight: this.loc.y,
                }}
            >
                {props.children}
            </div>
        );
    }
}

/////////
const _BASE = statefulHookedComponent({ loc: { x: 0, y: 0 } }, { loc: updatePos });
export class StateVarsComponent extends _BASE<Props> {
    public handleKey = this.updateState.bind(this, "loc");
    public useRender(props: Props) {
        useGenEffect(geneffs.eventListener("keypress", this.handleKey));
        return (
            <div
                style={{
                    ...defaultStyle,
                    backgroundColor: props.bgColour,
                    marginLeft: this.loc.x,
                    marginRight: this.loc.y,
                }}
            >
                {props.children}
            </div>
        );
    }
}

export class Counter extends statefulHookedComponent({ count: 0 })<{}> {
    // @HookedComponent.RenderAffecting
    public message = "hello ";
    private readonly increment = () => {
        this.updateState("count", (count) => count + 1);
    };
    private readonly handle = (ev: KeyboardEvent) => {
        this.message += " ";
        this.message += ev.key;
    };
    public useRender() {
        useGenEffect(geneffs.eventListener("keyup", this.handle));
        // React.useEffect(()=>{
        //     window.addEventListener("keyup", this.handle);
        //     return ()=>{
        //         window.removeEventListener("keyup", this.handle)
        //     }
        // }, [this.handle])

        return (
            <button onClick={this.increment}>
                I've been clicked {this.count} times!
                <br />
                {this.message}
            </button>
        );
    }
    public static readonly JSX = HookedComponent.finalize(Counter);
}
