// @flow
import React from 'react';

import { UserSelectedSubscriber, useUserSelected } from '../components/user';
import { TodoContainer, TodoSubscriber, useTodo } from '../components/todo';
import { type TodoModel } from '../components/todo/types';

type TodoItemProps = {
  todo: TodoModel,
};

const TodoItem = ({ todo }: TodoItemProps) => (
  <li className="TodoItem">{todo.title}</li>
);

type TodoListProps = {
  selectedUser: ?string,
  todos: TodoModel[] | null,
  loading: boolean,
};

const TodoList = ({ todos, loading, selectedUser }: TodoListProps) =>
  !selectedUser || !todos || loading ? (
    <div className="TodoList">
      {loading ? 'Loading...' : 'Select a user first'}
    </div>
  ) : (
    <ul className="TodoList">
      {todos.map(todo => (
        <TodoItem key={todo.title} todo={todo} />
      ))}
    </ul>
  );

export const TodoListRpc = () => (
  <UserSelectedSubscriber>
    {({ sel }) => (
      <TodoContainer selectedUser={sel}>
        <TodoSubscriber>
          {({ data, loading }) => (
            <TodoList todos={data} loading={loading} selectedUser={sel} />
          )}
        </TodoSubscriber>
      </TodoContainer>
    )}
  </UserSelectedSubscriber>
);

type UserTodosProps = { selectedUser: ?string };

const UserTodos = ({ selectedUser }: UserTodosProps) => {
  const [{ data, loading }] = useTodo();
  return (
    <TodoList todos={data} loading={loading} selectedUser={selectedUser} />
  );
};

export const TodoListHook = () => {
  const [{ sel }] = useUserSelected();
  return (
    <TodoContainer selectedUser={sel}>
      <UserTodos selectedUser={sel} />
    </TodoContainer>
  );
};
