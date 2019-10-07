// @flow
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { defaults } from 'react-sweet-state';

import '@babel/polyfill';

import { TodosContainer } from './components/todos';
import { TreeHooks } from './views/tree-hooks';

const batchUpdateMiddleware = () => next => fn => {
  let result;
  ReactDOM.unstable_batchedUpdates(() => {
    result = next(fn);
  });
  return result;
};
defaults.middlewares.add(batchUpdateMiddleware);

const [DEPTH = 1] = window.location.hash.replace('#', '').split('|');

const RenderBlocker = React.memo<*>(({ children }: any) => children);

/**
 * Main App
 */
class App extends Component<{}, any> {
  state = {
    depth: Number(DEPTH),
  };

  onChangeDepth = ev => {
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
          {['1', '3', '5', '10'].map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <main style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <div>
            <TodosContainer n={depth}>
              <TreeHooks n={depth} prefix="pure" Separator={RenderBlocker} />
            </TodosContainer>
          </div>
          <div>
            <TodosContainer n={depth}>
              <TreeHooks n={depth} prefix="flow" Separator={Fragment} />
            </TodosContainer>
          </div>
        </main>
      </div>
    );
  }
}

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'));
