
import React from 'react';

import {HookedComponent, statefulHookedComponent} from './hooklib';

// interface Props<T> {
//     id: number;
//     a: T;
//     b?: T;
// }

// class Example1<T> extends HookedComponent<Props<T>>{
//     public static JSX = HookedComponent.finalize(Example1, {id: 0});
//     a: string = "hello";
//     useRender(p: Props<T>){
//         return null;
//     }
// }
// declare const refStr: React.Ref<Example1<string>>;
// declare const refNum: React.Ref<Example1<number>>;
// const a = <Example1.JSX a="hello" b="" id={0} ref={refStr}/>
// const b = <Example1.JSX a={4} ref={refNum}/>
// type A = HookedComponent.INIT_ARG<{}>;
function TESTDECO<T, K extends keyof T>(proto: T, field: K, x?: {initializer?: ()=>T[K]}){
    const descr: PropertyDescriptor = {
        get(this: T){
            console.log("CALLING GETTER", this, field)
            return x?.initializer?.();
        },
        set(this: T, newVal: T[K]){
            console.log("CALLING SETTER", this, field, newVal);
        }
    }
    return descr as any;
}
class Test {
    @TESTDECO
    public x = (console.log("RAN INIT"), "initial")
}

export class Counter extends statefulHookedComponent({count:0})<{}> {
    // static JSX = HookedComponent.finalize(Counter);
    private t = new Test();
    private increment = ()=>{
        this.updateState("count", count=>count+1);
    }

    * check(){
        yield [this.count];
        console.log("HI", this.t.x)
        this.t.x = "SET VALUE"
    }
    public useRender(){
        // useGenEffect(this.check())
        return <button onClick={this.increment}>
            I've been clicked {this.count} times!
        </button>
    }
}
// HookedComponent.magicStatePostStep(Counter.prototype, ["count"])
export default HookedComponent.finalize(Counter);
