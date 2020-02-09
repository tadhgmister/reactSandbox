import React from "react";
import { HookedComponent } from "src/lib/hooklib";
import {Main} from 'src/lib/reactUtil'
import SongPage from "./SongPage";
import { Link, Switch, Route } from "react-router-dom";
import {fetchFolderContent} from "src/lib/util";
const initialState = {
    songs: [] as string[]
};



class Glee extends React.Component<any,typeof initialState> {
  state = initialState;
  constructor(ip:any){
      super(ip);
      fetchFolderContent("gleemusic").then(data=>{
          this.setState({songs: data});
      });
  }
  public render() {
    const songlinks = this.state.songs.map(song => <p><Link to = {song}>{song}</Link></p>)
    const switches = <Switch>
        <Route path = {"/glee"} exact = {true}>
            {this.state.songs.map(song => <p><Link to = {song}>{song}</Link></p>)}
        </Route>
        {this.state.songs.map(song => <Route path = {`/glee/${song}`}>
            <SongPage songName = {song}/>
        </Route>)}
    </Switch>
    
    return <Main className="glee">
        {switches}
    </Main>
  }
  
}
export default Glee