// @flow

import React, { useEffect } from 'react';
import { useTodosFiltered, useTodosActions } from '../components/todos';

import { useCounter } from '../components/count';

function TodosDoneCount() {
  const [{ data }] = useTodosFiltered({ isDone: true });
  return <span>{data.length}</span>;
}

function TodosApp({ n, children, Separator }: any) {
  return (
    <Separator>
      <span>Container {n} </span>
      <TodosDoneCount />
      <br />
      {children}
    </Separator>
  );
}

export function TreeHooks({ n, prefix, Separator, currentDepth = 0 }: any) {
  const [{ count }, { increment }] = useCounter();
  if (currentDepth === 0) {
    /* eslint-disable react-hooks/rules-of-hooks */
    const [, { toggle }] = useTodosActions();
    useEffect(() => {
      if (count % 2 === 0) {
        window.requestAnimationFrame(() => {
          increment();
          toggle();
        });
      }
    }, [increment, toggle, currentDepth, count]);
  }

  return (
    <Separator>
      {currentDepth ? null : count}
      <div>
        <TodosApp
          n={n}
          currentDepth={currentDepth}
          prefix={prefix}
          Separator={Separator}
        >
          {Array.from({ length: n - 1 }).map((__, i) => (
            <TreeHooks
              key={i + 1}
              n={i + 1}
              currentDepth={currentDepth + 1}
              prefix={prefix}
              Separator={Separator}
            />
          ))}
        </TodosApp>
      </div>
    </Separator>
  );
}
