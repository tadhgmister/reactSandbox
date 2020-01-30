
import React from 'react';

import {HookedComponent, statefulHookedComponent} from './hooklib';

export class Counter extends statefulHookedComponent({count:0})<{}> {
    static JSX = HookedComponent.finalize(Counter);

    private increment = ()=>{
        this.updateState("count", count=>count+1);
    }
    public useRender(){
        // useGenEffect(this.check())
        return <button onClick={this.increment}>
            I've been clicked {this.count} times!
        </button>
    }
}
// HookedComponent.magicStatePostStep(Counter.prototype, ["count"])
export default Counter.JSX;//HookedComponent.finalize(Counter);
