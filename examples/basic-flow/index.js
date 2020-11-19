// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { defaults } from 'react-sweet-state';

import { useCounter } from './components';

/**
 * Enable Batch updates
 */
defaults.batchUpdates = true;

/**
 * Components
 */
const CounterHook = () => {
  const [{ count }, { increment }] = useCounter();

  return (
    <div>
      <h3>With Hooks</h3>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
};

/**
 * Main App
 */
const App = () => (
  <div>
    <h1>Simple counter example</h1>
    <main>
      <CounterHook />
    </main>
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
