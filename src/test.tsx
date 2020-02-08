import React from "react";
const CREATEELEM = React.createElement;

class Component<P = {}, S = {}, CC = any> extends React.Component<P, S, CC> {
    // this removes the availability of the legacy overload in the base class
    // thereby fixing the issue propogating generics down the line.
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(initialProps: P) {
        super(initialProps);
    }
}
interface ExampleProps<T> {
    a: T;
    b: T;
}
class Example<T> extends Component<ExampleProps<T>> {}

type ClsConstraint = new (p: any) => Component<any, any>;
type ClsProps<Cls extends ClsConstraint> = Cls extends new (p: infer P) => Component<infer P, any>
    ? P
    : never;

declare function createElemCurry<K extends keyof React.ReactHTML>(tag: K): React.ReactHTML[K];
declare function createElemCurry<P, I>(Cls: new (p: P) => I): (p: P) => I;

const result1 = createElemCurry("abbr");
const result2 = createElemCurry(Example);

const x = <input onChange={a => {}}></input>;
