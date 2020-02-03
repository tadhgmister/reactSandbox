export default null;
// import React from 'react';
// import ReactDOM from 'react-dom'
// import {HookedComponent, statefulHookedComponent, GenEffect, useGenEffect} from './hooklib';
// import { assert } from './util';

// export class Popout extends HookedComponent {
//     private myWindow?: Window;
//     @HookedComponent.RenderAffecting
//     public mainDiv?: HTMLElement;

//     public useRender(props: React.PropsWithChildren<{}>){
//         if(this.mainDiv){
//             return ReactDOM.createPortal(props.children, this.mainDiv);
//         }
//         return <div style={{backgroundColor: "lightgreen"}}>
//             <button onClick={this.move_to_own_window}>move to window</button>
//             {props.children}
//         </div>;
//     }
//     private move_to_own_window = ()=>{
//         const win = window.open("","");
//         if(win === null){
//             alert("failed to open new window")
//             return
//         }
//         this.myWindow = win;
//         win.document.write(`<div id="main"></div>`);
//         this.mainDiv = win.document.getElementById("main")!
//     }
//     public static JSX: typeof _JSX;
// }
// const _JSX = HookedComponent.finalize(Popout);
// Popout.JSX = _JSX;
// export default _JSX;