import React from "react";
import { Switch, Route, RouteComponentProps } from "react-router";
import { isA, ObjectEntries, waitUntilIdle } from "./util";
import { useGenEffect } from "./hooklib";

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
        .map(a => parseOneStyle(...a))
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

type LazyLoad =
    | { exact?: boolean; comp: React.ComponentType<RouteComponentProps> }
    | (() => Promise<{
          default: React.ComponentType<RouteComponentProps>;
      }>);
/**
 * takes a map of path to one of:
 * - function to be passed to React.lazy, so ()=>import("MODULE")
 * - object with 'comp' to a react component and optionally 'exact' set to true to match only exact path.
 * returns a component that renders the components when the paths match, if none of the paths match
 * then the children of the component is rendered.  The component also optionally takes a prop 'preamble'
 * which is rendered inside the switch before all the routes, this lets you specify reroutes or special routes.
 * @param mapping {"/PATH": ()=>import("MODULE"), ...}
 */
export function makeLazyLoadSwitch(mapping: Record<string, LazyLoad>) {
    const routes: React.ReactNode[] = [];
    for (const [path, comp] of Object.entries(mapping)) {
        if (isA("function", comp)) {
            routes.push(<Route key={path} path={path} component={React.lazy(comp)} />);
        } else {
            routes.push(<Route key={path} path={path} component={comp.comp} exact={comp.exact} />);
        }
    }
    return function PathSwitch({
        children,
        preamble,
    }: React.PropsWithChildren<{ preamble?: React.ReactNode }>) {
        return (
            <Switch>
                {preamble}
                {routes}
                <Route>{children}</Route>
            </Switch>
        );
    };
}
