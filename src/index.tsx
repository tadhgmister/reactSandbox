import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter, Link, Switch, Route, useLocation } from "react-router-dom";
import { makeCompSwitch } from "./lib/reactUtil";

const Routes = makeCompSwitch({
    "splash/": React.lazy(() => import("./Splash/App")),
    "demos/": React.lazy(() => import("./Demos/demos")),
    "asteroids/": React.lazy(() => import("./Asteroids/Game")),
    "gleemusic/": React.lazy(() => import("./GLEEEEE/HOOOOME")),
    "match game/": React.lazy(() => import("./Match3/MatchGame")),
});

function Nav() {
    const { pathname } = useLocation();
    const pathlevels = pathname.split("/");
    const levelstoremove = pathname.endsWith("/") ? 2 : 1;
    const backPath = pathlevels.slice(0, pathlevels.length - levelstoremove).join("/");
    return ReactDOM.createPortal(
        <nav>
            <Switch>
                <Route exact path="/" />
                {/* for any route other than root, create a link going back a page. */}
                <Route>
                    <Link to={backPath}>Back</Link>
                </Route>
            </Switch>
        </nav>,
        document.getElementById("topbar")!,
    );
}
/**
 * due to the occasional error inside react so that we don't get popup (input tag should not have any text inside)
 * this will catch any errors and give a clean way to reload the current page without too much hassle.
 */
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
                <Routes />
            </ErrorCatch>
        </React.Suspense>
    </BrowserRouter>,
    document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
