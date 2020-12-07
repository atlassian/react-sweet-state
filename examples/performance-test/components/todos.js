// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  type Action,
  type ContainerComponent,
  type SubscriberComponent,
  type HookFunction,
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
  add: (title: string): Action<State> => ({ setState, getState }) => {
    currentId++;
    const newTodo = { id: currentId, title, isDone: false };
    setState({
      byId: { ...getState().byId, [newTodo.id]: newTodo },
      order: getState().order.concat(newTodo.id),
    });
  },

  toggle: (todoId: number): Action<State> => ({ setState, getState }) => {
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

type ContainerProps = { n: number };
export const TodosContainer: ContainerComponent<ContainerProps> = createContainer(
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

type GetAllTodos = { data: TodoModel[], loading: boolean };
const getAllTodosSelector = (state) => ({
  data: state.order.map((v) => state.byId[v]),
  loading: state.loading,
});

export const TodosSubscriber: SubscriberComponent<
  GetAllTodos,
  Actions
> = createSubscriber(Store, {
  selector: getAllTodosSelector,
});

export const useTodos: HookFunction<GetAllTodos, Actions> = createHook(Store, {
  selector: getAllTodosSelector,
});

type TodosCount = { count: number };
const getTodosCountSelector = (state) => ({ count: state.order.length });

export const TodosCountSubscriber: SubscriberComponent<
  TodosCount,
  Actions
> = createSubscriber(Store, {
  selector: getTodosCountSelector,
});

export const useTodosCount: HookFunction<TodosCount, Actions> = createHook(
  Store,
  {
    selector: getTodosCountSelector,
  }
);

type TodosFilteredProps = { isDone: boolean };
type FilteredTodos = { data: TodoModel[], loading: boolean };

const getFilteredTodosSelector = (state, props) => ({
  data: state.order
    .map((v) => state.byId[v])
    .filter((t) => t.isDone === props.isDone),
  loading: state.loading,
});

export const TodosFilteredSubscriber: SubscriberComponent<
  FilteredTodos,
  Actions,
  TodosFilteredProps
> = createSubscriber(Store, {
  selector: getFilteredTodosSelector,
});

export const useTodosFiltered: HookFunction<
  FilteredTodos,
  Actions,
  TodosFilteredProps
> = createHook(Store, {
  selector: getFilteredTodosSelector,
});
