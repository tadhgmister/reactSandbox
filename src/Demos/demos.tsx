import React from "react";
import { HookedComponent } from "src/lib/hooklib";
import { Popout } from "src/lib/Popout";
import { Main } from "src/lib/reactUtil";
import store from "src/redux";
import * as actions from "src/redux/actions";
export class Demos extends HookedComponent {
    public useRender() {
        const bg = store.useState(({ theme }) => theme.bg);
        return (
            <Main className="Demos" style={{ backgroundColor: bg }}>
                <PopoutDemo.JSX />
                <ReduxDemo.JSX></ReduxDemo.JSX>
            </Main>
        );
    }
    /** valid react component for this class, to be used in JSX code. */
    public static JSX: typeof _JSX;
}
const _JSX = HookedComponent.finalize(Demos);
Demos.JSX = _JSX;
export default Demos.JSX;

class PopoutDemo extends HookedComponent {
    @HookedComponent.RenderAffecting
    private count = 0;
    public useRender() {
        return (
            <div style={{ backgroundColor: "rgba(255,0,0,0.3)" }}>
                You clicked {this.count} times!
                <Popout.JSX w={100} h={100} style={{ backgroundColor: "lightgreen" }}>
                    <button onClick={() => this.count++}>CLICK ME!</button>
                </Popout.JSX>
            </div>
        );
    }
    public static JSX: typeof _JSXPopoutDemo;
}
const _JSXPopoutDemo = HookedComponent.finalize(PopoutDemo);
PopoutDemo.JSX = _JSXPopoutDemo;

class ReduxDemo extends HookedComponent {
    private textFieldRef = React.createRef<HTMLInputElement>();
    public useRender() {
        return (
            <div style={{ backgroundColor: "white", margin: 5 }}>
                enter background colour:<input ref={this.textFieldRef}></input>
                <button onClick={this.changeBackground}>Set bg</button>
            </div>
        );
    }
    private changeBackground = () => {
        // throw new Error("ERROR?")
        actions.changeBg(this.textFieldRef.current?.value);
    };
    public static JSX: typeof _JSXReduxDemo;
}
const _JSXReduxDemo = HookedComponent.finalize(ReduxDemo);
ReduxDemo.JSX = _JSXReduxDemo;
