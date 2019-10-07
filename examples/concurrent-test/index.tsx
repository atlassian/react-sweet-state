// @flow
import React, { useReducer, useEffect } from 'react';
import ReactDOM from 'react-dom';

import '@babel/polyfill';

import { useCounter } from './components';
import {
  syncBlock,
  useCheckTearing,
  useRegisterIncrementDispatcher,
  ids,
} from './utils';

const Counter = React.memo(() => {
  const [{ count }] = useCounter();
  syncBlock();
  return <span className="count">{count}</span>;
});

const Main = () => {
  const [{ count }, actions] = useCounter();
  const [localCount, localIncrement] = useReducer(c => c + 1, 0);
  useCheckTearing();
  useRegisterIncrementDispatcher(actions.increment);

  useEffect(() => {
    const btn = document.querySelector('#remoteIncrement');
    setTimeout(() => btn.click(), 100);
    setTimeout(() => btn.click(), 150);
  }, []);
  return (
    <div>
      <h3>Remote Count</h3>
      {ids.map(id => (
        <Counter key={id} />
      ))}
      <h3>Local Count</h3>
      <strong className="count">{count} / </strong>
      {localCount}
      <button type="button" id="localIncrement" onClick={localIncrement}>
        Increment local count
      </button>
    </div>
  );
};

/**
 * Main App
 */
const App = () => <Main />;

// @ts-ignore
const root = ReactDOM.unstable_createRoot(document.getElementById('root'));
root.render(<App />);
// ReactDOM.render(<App />, document.getElementById('root'));
