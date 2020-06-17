import React from "react";
import { HookComp } from "src/lib/oldHookCls/hooklib2";
import { makeCompSwitch } from "src/lib/reactUtil";
import { SongPage } from "./SongPage";
// import { Link, Switch, Route } from "react-router-dom";
import { fetchFolderContent } from "src/lib/util";

export class Glee extends HookComp {
    @HookComp.RenderAffecting
    routes?: React.ComponentType;
    constructor() {
        super();
        this.fetchSongList();
    }
    async fetchSongList() {
        let songs = await fetchFolderContent("gleemusic/");
        songs = songs.filter(f => !f.startsWith("."));
        const paths: Record<string, SongPage> = {};
        for (const song of songs) {
            paths[song] = new SongPage(song + "/");
        }
        this.routes = makeCompSwitch(paths);
    }

    useRender() {
        if (this.routes === undefined) return <p>not loaded yet</p>; // TODO: return unresolved lazy?
        return <this.routes />;
    }
}
export default HookComp.finalize(Glee);
// const initialState = {
//     songs: [] as string[],
// };

// class GleeOld extends React.Component<any, typeof initialState> {
//     state = initialState;
//     constructor(ip: any) {
//         super(ip);
//         fetchFolderContent("gleemusic").then(data => {
// this.setState({ songs: data });
//         });
//     }
//     public render() {
//         const songlinks = this.state.songs.map(song => (
//             <p>
//                 <Link to={song}>{song}</Link>
//             </p>
//         ));
//         const switches = (
//             <Switch>
//                 <Route path={"/glee"} exact={true}>
//                     <Main className="gleehome">
// {this.state.songs.map(song => (
//                             <p>
//                                 <Link to={song}>{song}</Link>
//                             </p>
//                         ))}
//                     </Main>
//                 </Route>

//                 {this.state.songs.map(song => (
//                     <Route path={`/glee/${song}`}>
//                         <SongPage songName={song} />
//                     </Route>
//                 ))}
//             </Switch>
//         );

//         return switches;
//     }
// }
