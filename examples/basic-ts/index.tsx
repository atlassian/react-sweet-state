// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import '@babel/polyfill';

import { CounterSubscriber, useCounter } from './components';

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

const CounterRpc = () => (
  <CounterSubscriber>
    {({ count }, { increment }) => (
      <div>
        <h3>With Render-props</h3>
        <p>{count}</p>
        <button onClick={increment}>+1</button>
      </div>
    )}
  </CounterSubscriber>
);

/**
 * Main App
 */
const App = () => (
  <div>
    <h1>Simple counter example</h1>
    <main>
      <CounterRpc />
      <hr />
      <CounterHook />
    </main>
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
