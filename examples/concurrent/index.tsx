import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { useCounter } from './components';

export const Expensive = () => {
  // Hog main thread for 500 milliseconds
  const start = Date.now();
  while (Date.now() - start < 100) {
    // do nothing
  }
  console.log('Render Expensive');

  return <div style={{ border: '1px solid black' }}>Expensive</div>;
};

/**
 * Main App
 */
const App = () => {
  const [{ count }, { increment }] = useCounter();

  return (
    <div>
      <h1>Expensive counter example</h1>
      <main>
        <p>{count}</p>
        <button onClick={increment}>+1</button>
        <hr />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <Expensive key={value} />
        ))}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
