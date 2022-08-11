// @flow
import React, { Component, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { Tree } from './views/tree';

const [DEPTH = '2'] = window.location.hash.replace('#', '').split('|');

/**
 * Main App
 */
class App extends Component<{}, any> {
  state = {
    depth: Number(DEPTH),
  };

  onChangeDepth = (ev) => {
    const depth = Number(ev.target.value);
    this.setState({ depth });
    window.location.hash = depth;
  };

  render() {
    const { depth } = this.state;
    return (
      <div>
        <h1>Performance</h1>
        Depth:{' '}
        <select onChange={this.onChangeDepth} value={depth}>
          {['0', '2', '5', '10'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <main>
          <Tree n={depth} />
        </main>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
