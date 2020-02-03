import React from "react";
import { ObjectEntries, waitUntilIdle } from "./util";
import { useGenEffect } from "./hooklib";
// import { useGenEffect } from "./hooklib";
// import { waitUntilIdle } from "./util";

/*
How to manage regular updates to a game screen?
- on browsers that support requestIdleCallback we can explicitly wait until there is nothing pending scheduling.
   - in this case we can in theory schedule as much as we want as long as we wait for idle between updates.
- on browsers that don't support that we would have to just set timeouts and hope we don't block meaningful things
  - can measure how long update actually takes and schedule timeout accordingly
   - min bound
    - if we want to not take up more than 1/4 of duty cycle we would need to set timeout to at least 3 times time to update
   - max bound
    - highest timeout we should set is based on framerate, 


Have one callback which is always called just to re-render the canvas etc.
every loop thing it just always gets called
second callback takes the time since last time it was called as input, 
- occasionally yields (it is a generator) to indicate it could stop there if needed.
  - requestIdleCallback gives timeRemaining, so at each yield point we check if we have run out of time.
  - if we reach end of updater with still more time we run render right away,
  - if we ran out of time then we schedule another wait until idle with a short timeout
*/

/*
EFFECTIVE COLLISION DETECTION
model each object as having a center and a radius, defined in a way where every point of the object that can
collide fits within a circle with center and radius. (so this wouldn't be the same as center of mass)
Then you can divide the whole grid into boxes with side length at least double the largest radius of object
with this definition each object could only collide with objects within it's own box or adjacent boxes.

Define a function which takes a list of objects with {x,y,r} yields pairs of objects that might collide
- then application code can handle detecting if they actually collide.
First go over all elements and find the box they fit into, if there aren't any items in that box then create a new box.
Then iterate over all boxes, for each one:
- check collision between all objects within the box
- also for half the touching boxes (since we go over all of them we need a way to visit each adjacent pairs)
  check collision between each object in both boxes.
*/
/** represents an object that could collide with other objects
 * the model is that all possible points of the object that can collide are inside the circle
 * centered at (x,y) with radius r.
 */
interface ObjectWithCollision {
    x: number;
    y: number;
    r: number;
}
/**
 * given a list of objects, this yields pairs [a,b] that might collide.
 * it is still up to you to actually check if they do collide but this narrows the possible list down from all pairs
 *
 * @param objs list of objects to check collision
 * @param maxr maximum radius of all objects, if not given is just calculated from list
 */
export function* possibleCollisions<T extends ObjectWithCollision>(objs: T[], maxr?: number) {
    if (maxr === undefined) {
        maxr = Math.max(...objs.map(v => v.r));
    }
    function* adjacency(key: string) {
        //  A  B  C
        //  D  E  F
        //  G  H  I
        // this takes E and yields F,G,H,I.
        // When bins A-D are checked they will include E
        const [x, y] = key.split(",").map(Number);
        yield `${x + 1}, ${y}`; // F
        yield `${x - 1}, ${y + 1}`; // G
        yield `${x}, ${y + 1}`; // H
        yield `${x + 1}, ${y + 1}`; // I
    }
    // fill into bins.
    const bins: Record<string, T[]> = {};
    for (const obj of objs) {
        const key = `${Math.floor(obj.x / maxr)},${Math.floor(obj.y / maxr)}`;
        (bins[key] ?? (bins[key] = [])).push(obj);
    }
    for (const [key, contents] of ObjectEntries(bins)) {
        // check all elements within the bin
        for (let i1 = 0; i1 < contents.length - 1; i1 += 1) {
            for (let i2 = i1 + 1; i2 < contents.length; i2 += 1) {
                yield [contents[i1], contents[i2]];
            }
        }
        // check adjacent bins
        for (const adj of adjacency(key)) {
            const other = bins[adj];
            if (other === undefined) continue;
            for (const mine of contents) {
                for (const theirs of other) {
                    yield [mine, theirs];
                }
            }
        }
    }
}

/**
 * When the requestIdleCallback is defined on the browser this will schedule updates to happen
 * as frequently as possible without lowering performance, passing the amount of time passed since last call in as an argument
 * If that is not present on the browser this is basically akin to setInterval.
 * @param callback callback to be called periodically ( argument is ms since last call)
 * @param minFPS lowest acceptable call frequency (calls per second), this affects the timeout used.
 */
export function useIntermittentUpdate(callback: (msSinceLastCall: number) => void, minFPS = 15) {
    const ref = React.useRef<[typeof callback, number]>();
    // need time in ms, FPS=1/s -> 1/FPS = s * 1000ms/s = 1000/minFPS (ms)
    ref.current = [callback, 1000 / minFPS];
    useGenEffect(setup());
    function* setup() {
        yield [];
        loop(); // start the loop
        yield;
        ref.current = undefined; // loop will stop when this is set to undefined.
    }
    async function loop() {
        /** time captured right before callback */
        let a = performance.now();
        /** time since last callback */
        let b = 0;
        while (ref.current !== undefined) {
            const [callback, timeout] = ref.current;
            await waitUntilIdle!(timeout);
            [a, b] = [performance.now(), a];
            callback(a - b);
        }
    }
}
