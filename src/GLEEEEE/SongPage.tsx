import React from "react";
import { HookedComponent } from "src/lib/hooklib";
import { Main } from "src/lib/reactUtil";
import { fetchFolderContent } from "src/lib/util";

class SongPageState {
    audioFiles: string[] = [];
    lyricsFile?: string;
}
interface SongPageProps {
    songName: string;
}

export default class SongPage extends React.Component<
    SongPageProps,
    SongPageState
> {
    state = new SongPageState();

    constructor(ip: any) {
        super(ip);
        fetchFolderContent(`gleemusic/${this.props.songName}`).then(data => {
            console.log("HERE", [...data]);
            const lyricsIndex = data.findIndex(file => file.endsWith(".pdf"));
            if (lyricsIndex != -1) {
                const lyricsFile = data.splice(lyricsIndex, 1)[0];
                this.setState({ lyricsFile: lyricsFile });
            }
            this.setState({ audioFiles: data });
        });
    }

    render() {
        return (
            <Main className="flexbox flexgrow">
                <div className="flexbox column">
                    {this.state.audioFiles.map(file => (
                        <React.Fragment>
                            <p>{file}</p>
                            <audio src={this.getFileName(file)} controls={true}>
                                UNSUPORTEEEEEEDDDDDDDDD!!!!! :(
                            </audio>
                        </React.Fragment>
                    ))}
                </div>

                <div className="flexbox flexgrow">{this.getLyrics()}</div>
            </Main>
        );
    }
    getFileName(fileName: string) {
        return `/gleemusic/${this.props.songName}/${fileName}`;
    }

    getLyrics() {
        if (this.state.lyricsFile == undefined) {
            return "Cannot find lyrics";
        } else {
            return (
                <embed
                    className="flexgrow"
                    src={this.getFileName(this.state.lyricsFile)}
                    type="application/pdf"
                />
            );
        }
    }
}
