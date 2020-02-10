import React from "react";
// import { HookedComponent } from "src/lib/hooklib";
import { Main } from "src/lib/reactUtil";
import { fetchFolderContent } from "src/lib/util";
import { HookComp } from "src/lib/hooklib2";
function isValidAudio(filename: string) {
    return [".mp3", ".m4a", ".wav"].some(ext => filename.endsWith(ext));
}
export class SongPage extends HookComp {
    @HookComp.RenderAffecting
    audioFiles: string[] = [];
    @HookComp.RenderAffecting
    lyricsFile?: string;

    rootFolder: string;
    constructor(songname: string) {
        super();
        this.rootFolder = `/gleemusic/${songname}/`;
        this.fetchFiles();
    }
    async fetchFiles() {
        const files = await fetchFolderContent(this.rootFolder);
        this.lyricsFile = files.find(file => file.endsWith(".pdf"));

        this.audioFiles = files.filter(isValidAudio);
    }
    useRender() {
        console.log("GOT TO SONG PAGE");
        return (
            <Main className="flex-row SongPage">
                <aside className="music-list">
                    {this.audioFiles.map(file => (
                        <React.Fragment key={file}>
                            <p>{file}</p>
                            <audio src={this.rootFolder + file} controls={true}>
                                UNSUPORTEEEEEEDDDDDDDDD!!!!! :(
                            </audio>
                        </React.Fragment>
                    ))}
                </aside>
                {this.getLyrics()}
            </Main>
        );
    }
    getLyrics() {
        if (this.lyricsFile === undefined) {
            return <p>"Cannot find lyrics"</p>;
        } else {
            return (
                <embed
                    style={{ flexGrow: 1 }}
                    src={this.rootFolder + this.lyricsFile}
                    type="application/pdf"
                />
            );
        }
    }
}

// class SongPageState {
//     audioFiles: string[] = [];
//     lyricsFile?: string;
// }
// interface SongPageProps {
//     songName: string;
// }
// export default class SongPageA extends React.Component<SongPageProps, SongPageState> {
//     state = new SongPageState();

//     constructor(ip: any) {
//         super(ip);
//         fetchFolderContent(`gleemusic/${this.props.songName}`).then(data => {
//             console.log("HERE", [...data]);
//             const lyricsIndex = data.findIndex(file => file.endsWith(".pdf"));
//             if (lyricsIndex != -1) {
//                 const lyricsFile = data.splice(lyricsIndex, 1)[0];
//                 this.setState({ lyricsFile: lyricsFile });
//             }
//             this.setState({ audioFiles: data });
//         });
//     }

//     render() {
//         return (
//             <Main className="flexbox flexgrow">
//                 <div className="flexbox column">
//                     {this.state.audioFiles.map(file => (
//                         <React.Fragment>
//                             <p>{file}</p>
//                             <audio src={this.getFileName(file)} controls={true}>
//                                 UNSUPORTEEEEEEDDDDDDDDD!!!!! :(
//                             </audio>
//                         </React.Fragment>
//                     ))}
//                 </div>

//                 <div className="flexbox flexgrow">{this.getLyrics()}</div>
//             </Main>
//         );
//     }
//     getFileName(fileName: string) {
//         return `/gleemusic/${this.props.songName}/${fileName}`;
//     }

//     getLyrics() {
//         if (this.state.lyricsFile == undefined) {
//             return "Cannot find lyrics";
//         } else {
//             return (
//                 <embed
//                     className="flexgrow"
//                     src={this.getFileName(this.state.lyricsFile)}
//                     type="application/pdf"
//                 />
//             );
//         }
//     }
// }
