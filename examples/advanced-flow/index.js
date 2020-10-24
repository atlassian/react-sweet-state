// @flow
import React, { useState, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { defaults, type Middleware } from 'react-sweet-state';

import '@babel/polyfill';

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
const App = () => {
  const [showTodos, toggleShowTodos] = useState(true);

  return (
    <div>
      <h1>User Todos example</h1>
      <button type="button" onClick={() => toggleShowTodos(!showTodos)}>
        Toggle todos visibility
      </button>
      <main>
        <div>
          <h3>With Render-props</h3>
          <UserListRpc />
          {showTodos && <TodoListRpc />}
        </div>
        <hr />
        <div>
          <h3>With Hooks</h3>
          <UserListHook />
          {showTodos && <TodoListHook />}
        </div>
      </main>
    </div>
  );
};

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
