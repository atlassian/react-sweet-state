// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { defaults } from 'react-sweet-state';

import '@babel/polyfill';

import { TreeRpc } from './views/tree-rpc';
import { TreeHooks } from './views/tree-hooks';

/**
 * Enable Batch updates
 */
defaults.batchUpdates = true;

const [TYPE = '', DEPTH = '2'] = window.location.hash
  .replace('#', '')
  .split('|');

/**
 * Main App
 */
class App extends Component<{}, any> {
  state = {
    type: TYPE,
    depth: Number(DEPTH),
  };

  onChangeType = (ev) => {
    const { depth } = this.state;
    const type = ev.target.value;
    this.setState({ type });
    window.location.hash = type + '|' + depth;
  };

  onChangeDepth = (ev) => {
    const { type } = this.state;
    const depth = Number(ev.target.value);
    this.setState({ depth });
    window.location.hash = type + '|' + depth;
  };

  render() {
    const { type, depth } = this.state;
    return (
      <div>
        <h1>Performance ({type})</h1>
        Type:{' '}
        <select onChange={this.onChangeType} value={type}>
          {['', 'rpc', 'hooks'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        Depth:{' '}
        <select onChange={this.onChangeDepth} value={depth}>
          {['2', '5', '10'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <main>
          {type === 'rpc' && <TreeRpc n={depth} />}
          {type === 'hooks' && <TreeHooks n={depth} />}
        </main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
