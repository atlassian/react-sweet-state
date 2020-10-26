// @flow
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { defaults } from 'react-sweet-state';

import { useTodo } from './controllers/todos';

/**
 * Enable Batch updates
 */
defaults.batchUpdates = true;

const COLLECTION = Array.from({ length: 500 });

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
  return (
    <div>
      <h1>Performance</h1>
      <button onClick={() => setCount(count + 1)}>Trigger</button>
      <main>
        {COLLECTION.map((v, n) => (
          <TodoView key={n} id={String(n)} count={count} />
        ))}
      </main>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
