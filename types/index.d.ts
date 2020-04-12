declare module 'react-sweet-state' {
  import { ComponentType, ReactNode, ReactElement } from 'react';

  interface SetState<TState> {
    (newState: Partial<TState>): void;
  }

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
  > = (...args: any[]) => ActionAny<TState, any>;

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

  type ActionAny<TState, TContainerProps = void, TReturnValue = any> = (
    api: StoreActionApi<TState>,
    containerProps: TContainerProps
  ) => TReturnValue;

  type BoundActions<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = {
    [K in keyof TActions]: (
      ...args: Parameters<TActions[K]>
    ) => ReturnType<ReturnType<TActions[K]>>;
  };

  interface StoreInstance<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > {
    storeState: StoreState<TState>;
    actions: BoundActions<TState, TActions>;
  }

  class Registry {
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
      scopeId?: string
    ) => StoreInstance<TState, TActions>;
    deleteStore: <
      TState,
      TActions extends Record<string, ActionThunk<TState, TActions>>
    >(
      store: Store<TState, TActions>,
      scopeId?: string
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
    mutator: (currentState: any, setStateArg: any) => any;
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
    TContainerProps = {}
  >(
    store: Store<TState, TActions>,
    options?: {
      onInit?: () => ActionAny<TState, TContainerProps>;
      onUpdate?: () => ActionAny<TState, TContainerProps>;
      onCleanup?: () => ActionAny<TState, TContainerProps>;
      displayName?: string;
    }
  ): ContainerComponent<TContainerProps>;

  /**
   * createSubscriber
   */

  type Selector<TState, TSubscriberProps, TOutput> = (
    state: TState,
    props: TSubscriberProps
  ) => TOutput;

  function createSubscriber<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TSelectedState = TState,
    TSubscriberProps = {}
  >(
    store: Store<TState, TActions>,
    options?: {
      displayName?: string;
      selector?: Selector<TState, TSubscriberProps, TSelectedState> | null;
    }
  ): SubscriberComponent<
    TSelectedState,
    BoundActions<TState, TActions>,
    TSubscriberProps
  >;

  /**
   * createHook
   */

  function createHook<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TSelectedState = TState,
    THookArg = void
  >(
    store: Store<TState, TActions>,
    options?: {
      selector?: Selector<TState, THookArg, TSelectedState> | null;
    }
  ): (
    ...args: THookArg extends undefined ? [] : [THookArg]
  ) => [TSelectedState, BoundActions<TState, TActions>];
}
