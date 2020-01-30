
import React from 'react';

type Abstraction<P> = {$$NEVER_USED: P};

declare class HookedComponent<P> {
    constructor(NEVER_PASSED?: Abstraction<P>)
    // public constructor();
    useRender(props: P): React.ReactNode;
}

// types seem to be working now.
function finalize<P, Inst extends HookedComponent<P>, DK extends keyof AllProps = never, AllProps extends P = P>(Cls: new(NEVER_PASSED?: Abstraction<P>)=>Inst, defaultProps?: Pick<AllProps, DK> | AllProps){
    // type DK = keyof DefProps;
    type OutwardProps = Partial<P> & Omit<P, DK> & {ref?: React.Ref<Inst>}
    function JSXFunc(props: OutwardProps, ref?: React.Ref<Inst>){
        return null;
    }
    return JSXFunc;
}

interface Props<T> {
    id: number;
    a: T;
    b?: T;
}

class Example<T> extends HookedComponent<Props<T>>{
    // constructor(){
    //     super();
    // }
    public static E = finalize(Example);
    a: string = "hello";
}

// const A = Example.E({})

const B = <Example.E a="hello" id={0} ref={null}/>


type TEST = React.ForwardRefExoticComponent;