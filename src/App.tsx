import React from 'react';
import logo from './logo.svg';
import './App.css';
import {HookedComponent} from './lib/hooklib';
import Counter from './lib/test';

class App extends HookedComponent<{}> {
  // public static JSX = HookedComponent.finalize(App);
  public useRender(){
    return (
      <div className="App">
        <header className="App-header">
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
          <Counter />
        </header>
      </div>
    );
  }
}

export default HookedComponent.finalize(App);
