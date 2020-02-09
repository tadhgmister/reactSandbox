import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter, Link, Switch, Route, useLocation } from "react-router-dom";
import { makeLazyLoadSwitch, Main } from "./lib/reactUtil";

const paths = {
    "/": { exact: true, comp: OpeningScreen },
    "/splash": () => import("./Splash/App"),
    "/demos": () => import("./Demos/demos"),
    "/asteroids": () => import("./Asteroids/Game"),
    "/glee/": ()=>import("./GLEEEEE/HOOOOME"),
};
const Routes = makeLazyLoadSwitch(paths);
function OpeningScreen() {
    return (
        <Main className="opening-page">
            Welcome to the website! here is a list of valid places to go:
            <ul>
                {Object.keys(paths).map(path => (
                    <li key={path}>
                        <Link to={path}>{path}</Link>
                    </li>
                ))}
            </ul>
        </Main>
    );
}
function Nav() {
    const {pathname} = useLocation();
    console.log("YOU ARE HERE:", pathname)
    return ReactDOM.createPortal(
        <nav>
            <Switch>
                <Route exact path="/" />
                <Route>
                    <Link to={pathname+"/.."}>Back</Link>
                </Route>
            </Switch>
        </nav>,
        document.getElementById("topbar")!,
    );
}
class ErrorCatch extends React.Component<{}, { err: Error | null }> {
    state: { err: Error | null } = { err: null };
    componentDidCatch(err: Error) {
        this.setState({ err: err });
    }
    render() {
        if (this.state.err !== null) {
            return (
                <React.Fragment>
                    <button onClick={() => this.setState({ err: null })}> reload</button>
                    error was caught:
                    <br />
                    <pre>{this.state.err.message}</pre>
                </React.Fragment>
            );
        }
        return <React.Fragment>{this.props.children}</React.Fragment>;
    }
}
ReactDOM.render(
    <BrowserRouter>
        <Nav />
        <React.Suspense fallback="LOADING!">
            <ErrorCatch>
                <Routes>PAGE COULD NOT BE FOUND</Routes>
            </ErrorCatch>
        </React.Suspense>
    </BrowserRouter>,
    document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
