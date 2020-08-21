import React from "react";
import { HookCls } from "src/lib/hookcls";
import { Main } from "src/lib/reactUtil";
import "./Match3.css";
import Tile from "./Tile";
/** all props for MatchGame */
interface MatchGame_AllProps extends React.PropsWithChildren<MatchGame_DefProps> {} // required props go in here.
/** props defined with default values. */
class MatchGame_DefProps {
    // props with default values here. remember to document all props
}
/**
 * TODO: DESCRIBE CLASS HERE
 */
export class MatchGame_Cls extends HookCls<MatchGame_AllProps> {
    public static defaultProps = new MatchGame_DefProps();
    protected useRender(props: MatchGame_AllProps) {
        const tiles = [..."abcdefg"].map((letter) => <Tile key={letter}>{letter}</Tile>);
        // can call hooks here. fill in rendering.
        return <Main className="match3">{tiles}</Main>;
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
