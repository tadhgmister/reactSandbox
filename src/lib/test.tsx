
import React from 'react';

import {HookedComponent} from './hooklib';

interface Props<T> {
    id: number;
    a: T;
    b?: T;
}

class Example<T> extends HookedComponent<Props<T>>{
    public static JSX = HookedComponent.finalize(Example, {id: 0});
    a: string = "hello";
    useRender(p: Props<T>){
        return null;
    }
}
declare const refStr: React.Ref<Example<string>>;
declare const refNum: React.Ref<Example<number>>;
const a = <Example.JSX a="hello" b="" id={0} ref={refStr}/>
const b = <Example.JSX a={4} ref={refNum}/>
