// @flow
import React, { StrictMode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { useTodo } from './controllers/todos';

const COLLECTION = Array.from({ length: 500 });
const ONE_EVERY = 10;

type TodoViewProps = { id: string, count: number };

const TodoView = ({ id, count }: TodoViewProps) => {
  const [todo, actions] = useTodo({ id });

  useEffect(() => {
    if (!todo) actions.create(id);
  }, [actions, id, todo]);

  useEffect(() => {
    actions.toggle(id);
  }, [actions, count, id]);

  return <div>{todo ? todo.title : 'creating...'}</div>;
};

/**
 * Main App
 */
const App = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setCount((c) => c + 1));
  });

  return (
    <div>
      <h1>Performance</h1>
      <button onClick={() => setCount(count + 1)}>Trigger</button>
      <main>
        {COLLECTION.map((v, n) => (
          <TodoView
            key={n}
            id={String(n)}
            count={Math.floor(count / ONE_EVERY)}
          />
        ))}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
