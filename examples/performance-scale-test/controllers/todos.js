// @flow

import {
  createStore,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';

type TodoModel = { id: string, title: string, isDone: boolean };

type State = {
  [key: string]: TodoModel,
};
type StoreApi = StoreActionApi<State>;
type Actions = typeof actions;

const initialState: State = {};

const actions = {
  create: (id: string) => ({ setState }: StoreApi) => {
    const newTodo = { id: id, title: `Todo ${id}`, isDone: false };
    setState({
      [newTodo.id]: newTodo,
    });
  },

  toggle: (todoId: string) => ({ setState, getState }: StoreApi) => {
    const todo = getState()[todoId];
    setState({
      [todo.id]: { ...todo, isDone: !todo.isDone },
    });
  },
};

const Store = createStore<State, Actions>({
  name: 'todos',
  initialState,
  actions,
});

/** Hooks */

const getAllTodosSelector = state => ({
  data: Object.keys(state).map(v => state[v]),
});

export const useTodos = createHook<State, Actions, *, empty>(Store, {
  selector: getAllTodosSelector,
});

export const useTodo = createHook<State, Actions, TodoModel, { id: string }>(
  Store,
  {
    selector: (state, arg) => state[arg.id],
  }
);
