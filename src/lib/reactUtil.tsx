import React from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router";
import { isA, ObjectEntries, ObjectKeys } from "./util";
import { useGenEffect } from "./hooks";
import { Link } from "react-router-dom";

function* withClassName<HTMLElem extends { classList: DOMTokenList } = HTMLElement>(
    elem: HTMLElem | null,
    classname: string,
) {
    yield arguments;
    if (elem === null) return;
    elem.classList.add(...classname.split(" "));
    yield;
    elem.classList.remove(...classname.split(" "));
}
interface StylesheetProps {
    /**
     * mapping of selector to CSSProperties
     * like {".SideMenu": {backgroundColor: "red"}} would style components with the "SideMenu" className to have red background.
     */
    styles: Record<string, React.CSSProperties>;
}
function parseOneStyle(selector: string, style: React.CSSProperties) {
    let code = "";
    for (const [field, value] of ObjectEntries(style)) {
        code += camelToDash(field) + ":" + value + ";";
    }
    return `${selector} {${code}}`;
}
/** JSX component that resolves to a <style> tag, uses react syntax for styling. */
export function Stylesheet({ styles }: StylesheetProps) {
    let code = ObjectEntries(styles)
        .map((a) => parseOneStyle(...a))
        .join("\n");
    return <style>{code}</style>;
}

function camelToDash(str: string) {
    return str.replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2");
}
interface MainProps extends React.PropsWithChildren<{}> {
    /** styles to apply to the main tag directly inside body */
    style?: React.CSSProperties;
    /** className to apply to the main tag directly inside body */
    className: string;
}
/**
 * applies styles to the main top level component.
 * all top level route based components should wrap contents around this.
 */
export function Main({ children, style, className }: MainProps) {
    const stylesheet = style === undefined ? null : <Stylesheet styles={{ "body>main": style }} />;
    useGenEffect(withClassName(document.getElementById("root"), className));

    return (
        <React.Fragment>
            {children}
            {stylesheet}
        </React.Fragment>
    );
}

type Comp<P> =
    | ((props: P) => React.ReactElement | null)
    | (new (props: P) => React.Component<P, any>);

/**
 * trims leading and trailing slashes in given string
 */
function trimSlashes(str: string) {
    return str.replace(/^\/+/, "").replace(/\/+$/, "");
}
export function makeCompSwitch<K extends string>(paths: Record<K, Comp<{}>>) {
    function RouteSwitch() {
        const match = useRouteMatch();
        const isProper = match.path.endsWith("/");
        const rootPath = isProper ? match.path : match.path + "/";
        const routes = ObjectEntries(paths).map(([path, comp]) => (
            <Route key={path} path={rootPath + path} component={comp} />
        ));
        const indexPage = () => {
            return (
                <Main className="index">
                    <ul>
                        {ObjectKeys(paths).map((path) => (
                            <li key={path}>
                                <Link to={rootPath + path}>{trimSlashes(path)}</Link>
                            </li>
                        ))}
                    </ul>
                </Main>
            );
        };
        const fallback = <p>404 page not found</p>;

        return (
            <Switch>
                <Route path={rootPath} exact component={indexPage} />
                {routes}
                <Route>{fallback}</Route>
            </Switch>
        );
    }
    return RouteSwitch;
}

/**
 * mostly stolen from https://github.com/carloluis/use-media-query-hook/blob/master/index.js
 */
function useMediaQuery(queryString: string) {
    const [queryMatch, dispatchUpdate] = React.useReducer(
        (prev: boolean, e: MediaQueryList | MediaQueryListEvent) => e.matches,
        undefined,
        () => window.matchMedia(queryString).matches,
    );
    useGenEffect(updateQuery());
    function* updateQuery() {
        yield [queryString];
        const e = window.matchMedia(queryString);
        dispatchUpdate(e);
        e.addListener(dispatchUpdate);
        yield;
        e.removeListener(dispatchUpdate);
    }
    return queryMatch;
}
