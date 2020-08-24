import React from "react";
import { HookCls } from "src/lib/hookcls";
import { Main } from "src/lib/reactUtil";
import styles from "./Match3.module.css";
import Tile from "./Tile";
/** all props for MatchGame */
interface MatchGame_AllProps extends React.PropsWithChildren<MatchGame_DefProps> {} // required props go in here.
/** props defined with default values. */
class MatchGame_DefProps {
    // props with default values here. remember to document all props
}
interface TileInfo {
    content: string;
    id: number;
}
/**
 * number of elements in grid, note that the css `grid-template-columns`
 * needs to match up with this for anything to work properly.
 */
const GRID_SIZE = 8;
/**
 * TODO: DESCRIBE CLASS HERE
 */
export class MatchGame_Cls extends HookCls<MatchGame_AllProps> {
    public static defaultProps = new MatchGame_DefProps();
    /**
     * this is render affecting but since we just modify in place we will call _force_update()
     * instead of re-writing the list.
     */
    private tiles: TileInfo[][];
    private nextId = 0;
    constructor() {
        super();
        this.tiles = [];
        for (let i = 0; i < GRID_SIZE; i += 1) {
            const column: TileInfo[] = [];
            for (let j = 0; j < GRID_SIZE; j += 1) {
                column.push(this.newTile());
            }
            this.tiles.push(column);
        }
    }
    protected useRender(props: MatchGame_AllProps) {
        return <Main className={styles.match3}>{[...this.renderTiles()]}</Main>;
    }
    private newTile(): TileInfo {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const c = characters.charAt(Math.floor(Math.random() * characters.length));
        return { content: c, id: this.nextId++ };
    }
    private deleteTile = (x: number, y: number) => {
        this.tiles[x].splice(y, 1);
        this.tiles[x].push(this.newTile());
        this._force_update();
    };
    protected *renderTiles() {
        for (let j = GRID_SIZE - 1; j >= 0; j -= 1) {
            for (let i = 0; i < GRID_SIZE; i += 1) {
                const { content, id } = this.tiles[i][j];
                yield (
                    <Tile key={id} del={this.deleteTile} x={i} y={j}>
                        {content}
                    </Tile>
                );
            }
        }
    }
}
/**
 * react component to implement MatchGame_Cls hook class.
 * @see MatchGame_Cls for full details.
 */
export const MatchGame = MatchGame_Cls.createComponent();
/** type is an alias to MatchGame_Cls so that importing react component also imports ref type */
export type MatchGame = MatchGame_Cls;
export default MatchGame;
/** props for MatchGame taking into account default props being optional */
export type MatchGameProps = Omit<MatchGame_AllProps, keyof MatchGame_DefProps> &
    Partial<MatchGame_AllProps>;
