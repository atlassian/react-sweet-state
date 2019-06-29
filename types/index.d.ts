declare module "react-sweet-state" {
  import { ComponentType, ReactNode, ReactElement } from "React";

  type StateSetter<TState> = (newState: Partial<TState>) => void;
  type StateGetter<TState> = () => Readonly<TState>;

  type Mutator<TState> = (state: {
    setState: StateSetter<TState>;
    getState: StateGetter<TState>;
  }) => void;

  type Action<TState> = (...args: any[]) => Mutator<TState>;

  export interface Configuration<
    TState,
    TActions extends Record<string, Action<TState>>
  > {
    name?: string;
    initialState: TState;
    actions: TActions;
  }

  export interface Store<
    TState,
    TActions extends Record<string, Action<TState>>
  > {}

  type RenderPropComponent<TState, TActions> = (TState, TActions) => ReactNode;

  type Selector<TState, TSelectedState> = (TState) => TSelectedState;

  type ContainerAction<TState, TActions, Props> = (
    state: {
      setState: StateSetter<TState>;
      getState: StateGetter<TState>;
      actions: TActions;
      dispatch: (actionThunk: ContainerAction<TState, TActions, Props>) => any;
    },
    containerProps: Props
  ) => any;

  export function createStore<
    TState,
    TActions extends Record<string, Action<TState>>
  >(config: Configuration<TState, TActions>): Store<TState, TActions>;

  export function createSubscriber<
    TState,
    TActions extends Record<string, Action<TState>>
  >(
    store: Store<TState, TActions>
  ): ComponentType<{ children: RenderPropComponent<TState, TActions> }>;

  export function createSubscriber<
    TState,
    TActions extends Record<string, Action<TState>>,
    TSelectedState
  >(
    store: Store<TState, TActions>, 
    options: {
      selector: Selector<TState, TSelectedState>,
      displayName?: string,
    }
  ): ComponentType<{ children: RenderPropComponent<TSelectedState, TActions> }>;

  export function createHook<
    TState,
    TActions extends Record<string, Action<TState>>
  >(store: Store<TState, TActions>): () => [TState, TActions];

  export function createHook<
    TState,
    TActions extends Record<string, Action<TState>>,
    TSelectedState
  >(
    store: Store<TState, TActions>, 
    options: {
      selector: Selector<TState, TSelectedState>,
    }
  ): () => [TSelectedState, TActions];

  export function createContainer<
    TState,
    TActions extends Record<string, Action<TState>>,
    Props
  >(
    store: Store<TState, TActions>,
    options?: {
      onInit?: ContainerAction<TState, TActions, Props>;
      onUpdate?: ContainerAction<TState, TActions, Props>;
      displayName?: string;
    }
  ): ComponentType<
    { scope?: string; isGlobal?: boolean; children: ReactElement } & Props
  >;

  export function createContainer<
    TState,
    TActions extends Record<string, Action<TState>>
  >(
    store: Store<TState, TActions>,
    options?: {
      onInit?: ContainerAction<TState, TActions, {}>;
      onUpdate?: () => ContainerAction<TState, TActions, {}>;
      displayName?: string;
    }
  ): ComponentType<
    { scope?: string; isGlobal?: boolean; children: ReactElement } & any
  >;
}
