// @flow

import {
  createStore,
  createHook,
  type Action,
  type HookFunction,
} from 'react-sweet-state';

type TodoModel = { id: string, title: string, isDone: boolean };

type State = {
  [key: string]: TodoModel,
};
type Actions = typeof actions;

const initialState: State = {};

const actions = {
  create: (id: string): Action<State> => ({ setState }) => {
    const newTodo = { id: id, title: `Todo ${id}`, isDone: false };
    setState({
      [newTodo.id]: newTodo,
    });
  },

  toggle: (todoId: string): Action<State> => ({ setState, getState }) => {
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

type AllTodos = { data: TodoModel[] };
const getAllTodosSelector = (state) => ({
  data: Object.keys(state).map((v) => state[v]),
});

export const useTodos: HookFunction<AllTodos, Actions> = createHook(Store, {
  selector: getAllTodosSelector,
});

export const useTodo: HookFunction<
  TodoModel,
  Actions,
  { id: string }
> = createHook(Store, {
  selector: (state, arg) => state[arg.id],
});
