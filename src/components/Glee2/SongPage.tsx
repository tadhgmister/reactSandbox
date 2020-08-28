import React from "react";
import { HookCls } from "src/lib/hookcls";
import { RouteComponentProps } from "react-router";
import { Main } from "src/lib/reactUtil";
import styles from "./Glee.module.css";
import { JSONstringify } from "src/lib/util";
type SongPageProps = RouteComponentProps<{ song: string }>;
/**
 * displays lyrics and playable media for one song.
 */
export class SongPage_Cls extends HookCls<SongPageProps> {
    protected useRender(props: SongPageProps) {
        const songTitle = props.match.params.song;
        return (
            <Main className={styles.SongPage}>
                Will load song: {songTitle}
                <pre>{JSONstringify(props)}</pre>
            </Main>
        );
    }
}
/**
 * react component to implement SongPage_Cls hook class.
 * @see SongPage_Cls for full details
 */
export const SongPage = SongPage_Cls.createComponent();
/** type is an alias to SongPage_Cls so that importing react component also imports ref type */
export type SongPage = SongPage_Cls;
export default SongPage;
