import React from "react";
import * as api from "src/api";
import { HookCls } from "src/lib/hookcls";
import { Main, makeCompSwitch, Unrenderable, IndexPage } from "src/lib/reactUtil";
import styles from "./Glee.module.css";

/**
 * dev notes
 * if the main page has to fetch song list to use makeCompSwitch then typing a song into the url
 * will require getting the list of songs before it can load that song
 * Instead we want to setup a route so that if it just goes to index it will load song list
 * otherwise any specific song will try to load that song page.
 * - need song page to be setup to take uri info to determine what song to load
 * - will have song index to just load list of songs and display as links
 * - will have router component be the main one to route either appropriately.
 */

/**
 * Index of songs to navigate to, deals with retreving the list of songs from server.
 */
export class SongIndex_Cls extends HookCls {
    @HookCls.RenderAffecting
    private songlist?: string[];
    @HookCls.RenderAffecting
    private error = null;
    constructor() {
        super();
        void api.fetchFolderContent("gleemusic").then(
            (songs) => {
                this.songlist = songs;
            },
            (err) => {
                this.error = err;
            },
        );
    }
    protected useRender() {
        if (this.error) {
            // just throw and let the error catcher get it,
            // theres not much better handling we could do here.
            throw this.error;
        }
        if (this.songlist === undefined) {
            // let suspense take over until we load.
            return <Unrenderable />;
        }
        return <IndexPage paths={this.songlist} rootPath="" />;
    }
}
/**
 * react component to implement SongIndex_Cls hook class.
 * @see SongIndex_Cls for full details
 */
export const SongIndex = SongIndex_Cls.createComponent();
/** type is an alias to SongIndex_Cls so that importing react component also imports ref type */
export type SongIndex = SongIndex_Cls;
export default SongIndex;
