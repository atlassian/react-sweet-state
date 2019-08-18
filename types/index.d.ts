declare module 'react-sweet-state' {
  import { ComponentType, ReactNode, ReactElement } from 'react';

  type SetState<TState> = (newState: Partial<TState>) => void;
  type GetState<TState> = () => Readonly<TState>;
  type StoreUnsubscribe = () => void;

  type RenderPropComponent<TState, TActions> = (
    state: TState,
    actions: TActions
  ) => ReactNode;

  type HookReturnValue<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = [TState, BoundActions<TState, TActions>];

  type ActionThunk<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = (...args: any[]) => ActionAny<TState, TActions>;

  type Store<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = {
    key: string[];
    initialState: TState;
    actions: TActions;
  };

  type StoreState<TState> = {
    getState: GetState<TState>;
    setState: SetState<TState>;
    key: string[];
    subscribe: (listener: () => void) => StoreUnsubscribe;
    mutator: SetState<TState>;
  };

  type StoreActionApi<TState> = {
    setState: SetState<TState>;
    getState: GetState<TState>;
    dispatch: <T extends ActionAny<TState, any>>(
      actionThunk: T
    ) => ReturnType<T>;
  };

  type ActionAny<TState, TContainerProps = void> = (
    api: StoreActionApi<TState>,
    containerProps: TContainerProps
  ) => any;

  type BoundActions<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = {
    [K in keyof TActions]: (
      ...args: Parameters<TActions[K]>
    ) => ReturnType<ReturnType<TActions[K]>>;
  };

  interface StoreInstance<TState, TActions> {
    store: StoreState<TState>;
    actions: TActions;
  }

  class Registry {
    configure(options: { initialStates?: { [key: string]: any } }): void;
    stores: Map<string, StoreInstance<any, any>>;
    initStore: <
      TState,
      TActions extends Record<string, ActionThunk<TState, TActions>>
    >(
      store: Store<TState, TActions>,
      key: string
    ) => StoreInstance<TState, TActions>;
    getStore: <
      TState,
      TActions extends Record<string, ActionThunk<TState, TActions>>
    >(
      store: Store<TState, TActions>,
      scopeId: string
    ) => StoreInstance<TState, TActions>;
    deleteStore: <
      TState,
      TActions extends Record<string, ActionThunk<TState, TActions>>
    >(
      store: Store<TState, TActions>,
      scopeId: string
    ) => void;
  }

  const defaultRegistry: Registry;

  type MiddlewareResult = any;
  type Middleware = (
    store: StoreState<any>
  ) => (
    next: (fn: any) => MiddlewareResult
  ) => (fn: () => any) => MiddlewareResult;

  const defaults: {
    devtools: boolean;
    middlewares: any;
    mutator: <TState>(
      prevState: TState,
      partialState: Partial<TState>
    ) => TState;
  };

  type ContainerComponent<TProps> = ComponentType<
    {
      scope?: string;
      isGlobal?: boolean;
    } & TProps
  >;

  type SubscriberComponent<
    TState,
    TActions,
    TProps = undefined
  > = ComponentType<
    {
      children: RenderPropComponent<TState, TActions>;
    } & TProps
  >;

  /**
   * createStore
   */

  function createStore<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  >(config: {
    initialState: TState;
    actions: TActions;
    name?: string;
  }): Store<TState, TActions>;

  /**
   * createContainer
   */

  function createContainer<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TProps = {}
  >(
    store: Store<TState, TActions>,
    options?: {
      onInit?: () => ActionAny<TState, TProps>;
      onUpdate?: () => ActionAny<TState, TProps>;
      displayName?: string;
    }
  ): ContainerComponent<TProps>;

  /**
   * createSubscriber
   */

  type Selector<TState, TProps, TOutput> = (
    state: TState,
    props: TProps
  ) => TOutput;

  function createSubscriber<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TSelectedState = TState,
    TProps = {}
  >(
    store: Store<TState, TActions>,
    options?: {
      displayName?: string;
      selector?: Selector<TState, TProps, TSelectedState> | null;
    }
  ): SubscriberComponent<
    TSelectedState,
    BoundActions<TState, TActions>,
    TProps
  >;

  /**
   * createHook
   */

  function createHook<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TSelectedState = TState,
    TArg = void
  >(
    store: Store<TState, TActions>,
    options?: {
      selector?: Selector<TState, TArg, TSelectedState> | null;
    }
  ): (
    ...args: TArg extends undefined ? [] : [TArg]
  ) => [TSelectedState, BoundActions<TState, TActions>];
}
