import React from "react";
import { Main } from "src/lib/reactUtil";
import { useIntermittentUpdate } from "src/lib/gameHelpers";
import { Actor } from "./Actor";
import { HookComp } from "src/lib/hooklib2";
/**
 * makes a callback that can take the time in ms since last time it was called and
 * will call the passed function in the given interval, the callback should return the time
 * until it should be called again.
 * @param initialWait initial time before being called for the first time
 * @param callback callback to be called, returns the time until it should be called again in ms
 */
function makeTimeoutCallback(initialWait: number, callback: () => number) {
    let counter = initialWait;
    function updater(timeSinceLastUpdate: number) {
        counter -= timeSinceLastUpdate;
        while (counter < 0) {
            counter += callback();
        }
    }
    return updater;
}

const SPEED = 0.1;
const ASTEROID_SIZE = 10;
const CANVAS_WIDTH = 200;
class _Game extends HookComp {
    @HookComp.RenderAffecting
    public asteroids: Array<{ x: number; y: number; key: number }> = [{ x: 0, y: 100, key: 1 }];
    private stop_updating = false;
    private asterref = React.createRef<Actor>();
    public useRender() {
        useIntermittentUpdate(this.update);
        if (this.asteroids?.[0].x > 100) {
            this.stop_updating = true;
            console.log("ASTER", this.asterref.current);
            console.log("GAME", this);
        }
        return (
            <Main className="Asteroids">
                <svg width={CANVAS_WIDTH} height={200}>
                    {this.asteroids.map(ast => (
                        <Actor.JSX {...ast} ref={this.asterref} />
                    ))}
                </svg>
            </Main>
        );
    }
    private update = (time: number) => {
        if (this.stop_updating) return;
        this.asteroids = this.asteroids.map(({ x, ...rest }) => ({ x: x + time * SPEED, ...rest }));

        this._request_update?.();
    };
    private *updateAsteroids(time: number, asteroids: this["asteroids"]) {
        for (const asteroid of asteroids) {
            asteroid.x -= SPEED * time;
            if (asteroid.x > -ASTEROID_SIZE) {
                yield asteroid;
            }
        }
    }
    private makeAsteroids = makeTimeoutCallback(0, () => {
        this.asteroids.push();
        return 1000;
    });
}
export const Game = HookComp.finalize(_Game);
export type Game = _Game;
export default Game;
