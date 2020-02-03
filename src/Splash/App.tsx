import React from 'react';
import logo from './logo.svg';
import './App.css';
import {HookedComponent} from '../lib/hooklib';
import { Main } from '../lib/reactUtil';

export class App extends HookedComponent<{}> {
  public useRender(){
    return (
      <Main className="App">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </Main>
    );
  }
  public static JSX: typeof _JSX;
}
const _JSX = App.finalize(App);
App.JSX = _JSX;
export default App.JSX;
