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

  type HookReturnValue<TState, TActions> = [TState, TActions];

  type ActionThunk<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = (...args: any[]) => Action<TState, any, any>;

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
    resetState: () => void;
    notify: () => void;
    key: string[];
    subscribe: (
      listener: (state: TState, storeState: StoreState<TState>) => void
    ) => StoreUnsubscribe;
    mutator: SetState<TState>;
  };

  type StoreActionApi<TState> = {
    setState: SetState<TState>;
    getState: GetState<TState>;
    dispatch: <T extends Action<TState, any, any>>(
      actionThunk: T
    ) => ReturnType<T>;
  };

  type Action<
    TState,
    TContainerProps = void,
    TReturnValue = void | Promise<void>
  > = (
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
    storeState: StoreState<any>
  ) => (next: (arg: any) => MiddlewareResult) => (arg: any) => MiddlewareResult;

  const defaults: {
    batchUpdates: boolean;
    devtools: boolean | ((storeState: StoreState<any>) => Record<string, any>);
    middlewares: Set<Middleware>;
    mutator: (currentState: any, setStateArg: any) => any;
  };

  function batch(callback: () => any): void;

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

  type HookFunction<TState, TActions, TArg = undefined> = (
    ...args: TArg extends undefined ? [] : [TArg]
  ) => HookReturnValue<TState, TActions>;

  /**
   * createStore
   */

  function createStore<
    TState extends object,
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
      onInit?: () => Action<TState, TContainerProps>;
      onUpdate?: () => Action<TState, TContainerProps>;
      onCleanup?: () => Action<TState, TContainerProps>;
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
  ): HookFunction<TSelectedState, BoundActions<TState, TActions>, THookArg>;

  /**
   * createSelector
   */
  type InputSelector<ST, PR, SE> = (state: ST, props: PR) => SE;

  type OutputSelector<ST, PR, SE> = {
    (state: ST, props: PR, ...rest: any[]): SE;
    resultFunc(...args: any[]): SE;
    dependencies: any[];
  };

  function createSelector<ST, PR, SE, T1>(
    selector1: InputSelector<ST, PR, T1>,
    resultFn: (arg1: T1) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1>(
    selectors: [InputSelector<ST, PR, T1>],
    resultFn: (arg1: T1) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2>(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    resultFn: (arg1: T1, arg2: T2) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2>(
    selectors: [InputSelector<ST, PR, T1>, InputSelector<ST, PR, T2>],
    resultFn: (arg1: T1, arg2: T2) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3>(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3>(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3, T4>(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    selector4: InputSelector<ST, PR, T4>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3, T4>(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>,
      InputSelector<ST, PR, T4>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3, T4, T5>(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    selector4: InputSelector<ST, PR, T4>,
    selector5: InputSelector<ST, PR, T5>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3, T4, T5>(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>,
      InputSelector<ST, PR, T4>,
      InputSelector<ST, PR, T5>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3, T4, T5, T6>(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    selector4: InputSelector<ST, PR, T4>,
    selector5: InputSelector<ST, PR, T5>,
    selector6: InputSelector<ST, PR, T6>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR, SE, T1, T2, T3, T4, T5, T6>(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>,
      InputSelector<ST, PR, T4>,
      InputSelector<ST, PR, T5>,
      InputSelector<ST, PR, T6>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => SE
  ): OutputSelector<ST, PR, SE>;
}
