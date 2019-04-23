// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { defaults } from 'react-sweet-state';

import { ChatRpc } from './views/chat-rpc';
import { ChatHook } from './views/chat-hook';
/**
 * Enable Redux devtools support
 */
defaults.devtools = true;

/**
 * Main App
 */
class App extends Component<
  {},
  { reset: number, remount: number, remoteUsers: number }
> {
  state = {
    reset: 0,
    remount: 0,
    remoteUsers: 20,
  };

  reset = () => {
    const reset = this.state.reset + 2;
    this.setState({ reset });
  };

  remount = () => {
    const remount = this.state.remount + 2;
    this.setState({ remount });
  };

  componentDidMount() {
    setInterval(() => {
      const remoteUsers = this.state.remoteUsers + ~~(Math.random() * 10 - 5);
      this.setState({ remoteUsers });
    }, 5000);
  }

  render() {
    const { reset, remount, remoteUsers } = this.state;
    return (
      <div>
        <h1>Chat example</h1>
        <button onClick={this.reset}>Reset theme (scope id change)</button>
        <button onClick={this.remount}>Reset form (local scope remount)</button>
        <main>
          <ChatRpc
            key={String(remount)}
            id={String(reset)}
            remoteUsers={remoteUsers}
            defaultColor="#FED"
          />
          <hr />
          <ChatHook
            key={String(remount + 1)}
            id={String(reset + 1)}
            remoteUsers={remoteUsers}
            defaultColor="#DED"
          />
        </main>
      </div>
    );
  }
}

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'));
