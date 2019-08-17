// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  type ActionApi,
} from 'react-sweet-state';

let currentId = 0;

type TodoModel = { id: number, title: string, isDone: boolean };

type State = {
  byId: { [key: number]: TodoModel },
  order: number[],
  loading: boolean,
};

type Actions = typeof actions;

const initialState: State = {
  byId: {},
  order: [],
  loading: false,
};

const actions = {
  add: (title: string) => ({ setState, getState }: ActionApi<State>) => {
    currentId++;
    const newTodo = { id: currentId, title, isDone: false };
    setState({
      byId: { ...getState().byId, [newTodo.id]: newTodo },
      order: getState().order.concat(newTodo.id),
    });
  },

  toggle: (todoId: number) => ({ setState, getState }: ActionApi<State>) => {
    const todo = getState().byId[todoId];
    setState({
      byId: {
        ...getState().byId,
        [todo.id]: { ...todo, isDone: !todo.isDone },
      },
    });
  },
};

const Store = createStore<State, Actions>({
  name: 'todos',
  initialState,
  actions,
});

/** Container */

type ContainerProps = {| n: number |};
export const TodosContainer = createContainer<State, Actions, ContainerProps>(
  Store,
  {
    onInit: () => ({ getState, dispatch }, { n }) => {
      if (getState().order.length) return;
      Array.from({ length: 10 * n }).map((__, i) => {
        const title = `Todo ${n}-${i + 1}`;
        dispatch(actions.add(title));
      });
    },
  }
);

/** Subscribers / Hooks */

const getAllTodosSelector = state => ({
  data: state.order.map(v => state.byId[v]),
  loading: state.loading,
});

export const TodosSubscriber = createSubscriber<State, Actions, *, {||}>(
  Store,
  {
    selector: getAllTodosSelector,
  }
);

export const useTodos = createHook<State, Actions, *, empty>(Store, {
  selector: getAllTodosSelector,
});

const getTodosCountSelector = state => ({ count: state.order.length });

export const TodosCountSubscriber = createSubscriber<State, Actions, *, {||}>(
  Store,
  {
    selector: getTodosCountSelector,
  }
);

export const useTodosCount = createHook<State, Actions, *, empty>(Store, {
  selector: getTodosCountSelector,
});

type TodosFilteredProps = {| isDone: boolean |};

const getFilteredTodosSelector = (state: State, props: TodosFilteredProps) => ({
  data: state.order
    .map(v => state.byId[v])
    .filter(t => t.isDone === props.isDone),
  loading: state.loading,
});

type FilteredTodosState = $Call<
  typeof getFilteredTodosSelector,
  State,
  TodosFilteredProps
>;

export const TodosFilteredSubscriber = createSubscriber<
  State,
  Actions,
  FilteredTodosState,
  TodosFilteredProps
>(Store, {
  selector: getFilteredTodosSelector,
});

export const useTodosFiltered = createHook<
  State,
  Actions,
  FilteredTodosState,
  TodosFilteredProps
>(Store, {
  selector: getFilteredTodosSelector,
});
