import React from "react";
import { HookedComponent } from "src/lib/hooklib";
import { Main } from "src/lib/reactUtil";
import { fetchFolderContent } from "src/lib/util";

const initialState = {
    files: [] as string[]
};
interface SongPageProps {
    songName: string;
}

export default class SongPage extends React.Component<
    SongPageProps,
    typeof initialState
> {
    state = initialState;

    constructor(ip: any) {
        super(ip);
        fetchFolderContent(`gleemusic/${this.props.songName}`).then(data => {
            this.setState({ files: data });
        });
    }

    render() {
        return (
            <div className="flexbox">
                <div className="flexbox column">
                    {this.state.files.map(file => (
                        <p>{file}</p>
                    ))}
                </div>

                <div className="flexbox">{this.getLyrics()}</div>
            </div>
        );
    }
    getLyrics() {
        const lyricsFile = this.state.files.find(file => file.endsWith(".pdf"));
        if (lyricsFile == undefined) {
            return "Cannot find lyrics";
        } else {
            return lyricsFile;
        }
    }
}
