// @flow

import React, { PureComponent, type Node } from 'react';
import {
  TodosContainer,
  TodosSubscriber,
  TodosCountSubscriber,
  TodosFilteredSubscriber,
} from '../components/todos';

class RenderBlocker extends PureComponent<any> {
  render() {
    return this.props.children;
  }
}

function TodosHeader({ children }: any) {
  return <TodosCountSubscriber>{() => children}</TodosCountSubscriber>;
}

function TodosDoneCount({ children }: any) {
  return (
    <TodosFilteredSubscriber isDone={true}>
      {({ data }) => (
        <>
          <span>{data.length}</span>
          <br />
          {children}
        </>
      )}
    </TodosFilteredSubscriber>
  );
}

const scheduleAction = (todosState, { toggle }) => {
  const todo = todosState.data[0];
  if (todo) {
    window.requestAnimationFrame(() => toggle(todo.id));
  }
};

function TodosTrigger({ children, enabled }: any) {
  return (
    <TodosSubscriber>
      {(todosState, todosActions) => {
        enabled && scheduleAction(todosState, todosActions);
        return children;
      }}
    </TodosSubscriber>
  );
}

function TodosApp({ n, depth, children }: any) {
  return (
    <RenderBlocker>
      <TodosContainer scope={String(n)} n={n}>
        <span>Container {n}</span>
        <RenderBlocker>
          <TodosHeader>
            <RenderBlocker>
              <TodosTrigger enabled={depth < 2}>
                <RenderBlocker>
                  <TodosDoneCount>
                    <RenderBlocker>{children}</RenderBlocker>
                  </TodosDoneCount>
                </RenderBlocker>
              </TodosTrigger>
            </RenderBlocker>
          </TodosHeader>
        </RenderBlocker>
      </TodosContainer>
    </RenderBlocker>
  );
}

export function TreeRpc({ n, depth = 0 }: any): Node {
  return (
    <RenderBlocker>
      <TodosApp n={n} depth={depth}>
        {Array.from({ length: n - 1 }).map((__, i) => (
          <TreeRpc key={i + 1} n={i + 1} depth={depth + 1} />
        ))}
      </TodosApp>
    </RenderBlocker>
  );
}
