import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { HookCls } from "src/lib/hookcls";
import { Main } from "src/lib/reactUtil";
/** default app provided by react create project, modified so it uses the hookcls. */
class App extends HookCls {
    public useRender() {
        return (
            <Main className="App">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </Main>
        );
    }
}

export default App.createComponent();
