import {
  createStore,
  createHook,
  type Action,
  createContainer,
} from 'react-sweet-state';

type TodoModel = { id: string; title: string; isDone: boolean };

type State = {
  [key: string]: TodoModel;
};
type Actions = typeof actions;

const initialState: State = {};

const actions = {
  create:
    (id: string): Action<State> =>
    ({ setState }) => {
      const newTodo = { id: id, title: `Todo ${id}`, isDone: false };
      setState({
        [newTodo.id]: newTodo,
      });
    },

  toggle:
    (todoId: string): Action<State> =>
    ({ setState, getState }) => {
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

const getAllTodosSelector = (state: State) => ({
  data: Object.keys(state).map((v) => state[v]),
});

export const useTodos = createHook(Store, {
  selector: getAllTodosSelector,
});

export const useTodo = createHook(Store, {
  selector: (state, arg: { id: string }) => state[arg.id],
});

export const TodosContainer = createContainer(Store);
