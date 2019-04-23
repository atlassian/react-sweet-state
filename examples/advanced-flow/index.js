// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { defaults, type Middleware } from 'react-sweet-state';

import { UserListRpc, UserListHook } from './views/user-list';
import { TodoListRpc, TodoListHook } from './views/todo-list';

/**
 * Add simple logger middleware
 */
const mw: Middleware = storeState => next => arg => {
  /* eslint-disable no-console */
  console.log(storeState.key, 'changing', arg);
  const result = next(arg);
  console.log(storeState.key, 'changed');
  return result;
};
defaults.middlewares.add(mw);
/**
 * Enable Redux devtools support
 */
defaults.devtools = true;

/**
 * Main App
 */
class App extends Component<{}> {
  render() {
    return (
      <div>
        <h1>User Todos example</h1>
        <main>
          <div>
            <h3>With Render-props</h3>
            <UserListRpc />
            <TodoListRpc />
          </div>
          <hr />
          <div>
            <h3>With Hooks</h3>
            <UserListHook />
            <TodoListHook />
          </div>
        </main>
      </div>
    );
  }
}

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'));
