// @flow

import {
  createStore,
  createContainer,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';

let currentId = 0;

type TodoModel = { id: number, title: string, isDone: boolean };

type State = {
  byId: { [key: number]: TodoModel },
  order: number[],
  loading: boolean,
};
type StoreApi = StoreActionApi<State>;
type Actions = typeof actions;

const initialState: State = {
  byId: {},
  order: [],
  loading: false,
};

const actions = {
  add: (title: string) => ({ setState, getState }: StoreApi) => {
    currentId++;
    const newTodo = { id: currentId, title, isDone: false };
    setState({
      byId: { ...getState().byId, [newTodo.id]: newTodo },
      order: getState().order.concat(newTodo.id),
    });
  },

  toggle: () => ({ setState, getState }: StoreApi) => {
    const todoId = getState().order[0];
    const todo = getState().byId[todoId];
    setState({
      byId: {
        ...getState().byId,
        [todo.id]: { ...todo, isDone: !todo.isDone },
      },
      loading: false,
    });
  },
};

const Store = createStore<State, Actions>({
  name: 'todos',
  initialState,
  actions,
});

/** Container */

type ContainerProps = {|
  n: number,
|};
export const TodosContainer = createContainer<State, Actions, ContainerProps>(
  Store,
  {
    onInit: () => ({ getState, dispatch }, { n }) => {
      if (getState().order.length) return;
      Array.from({ length: 2 * n }).map((__, i) => {
        const title = `Todo ${n}-${i + 1}`;
        dispatch(actions.add(title));
      });
    },
  }
);

/**  Hooks */

export const useTodosActions = createHook<State, Actions, void, empty>(Store, {
  selector: null,
});

type TodosFilteredProps = {|
  isDone: boolean,
|};

const getFilteredTodosSelector = (state: State, props: TodosFilteredProps) => ({
  data: state.order
    .map(v => state.byId[v])
    .filter(t => t.isDone === props.isDone),
  loading: state.loading,
});

export const useTodosFiltered = createHook<
  State,
  Actions,
  *,
  TodosFilteredProps
>(Store, {
  selector: getFilteredTodosSelector,
});
