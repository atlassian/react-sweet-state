declare module 'react-sweet-state' {
  import type {
    ComponentType,
    ReactNode,
    PropsWithChildren,
    FunctionComponent,
  } from 'react';

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
  > = (...args: any) => Action<TState, any, any>;

  type Store<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = {
    key: string;
    initialState: TState;
    actions: TActions;
    containedBy?: ContainerComponent<any>;
    handlers?: {
      onInit?: () => Action<TState, any, any>;
      onUpdate?: () => Action<TState, any, any>;
      onDestroy?: () => Action<TState, any, any>;
      onContainerUpdate?: (
        nextProps: any,
        prevProps: any
      ) => Action<TState, any, any>;
    };
  };

  type StoreState<TState> = {
    getState: GetState<TState>;
    setState: SetState<TState>;
    resetState: () => void;
    notify: () => void;
    key: string;
    subscribe: (listener: () => void) => StoreUnsubscribe;
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
    hasStore: <
      TState,
      TActions extends Record<string, ActionThunk<TState, TActions>>
    >(
      store: Store<TState, TActions>,
      scopeId?: string
    ) => boolean;
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
    /**
     * @deprecated Batching is enabled by default in React 18+ and turning it off will be deprecated in next major
     */
    batchUpdates: boolean;
    devtools: boolean | ((storeState: StoreState<any>) => Record<string, any>);
    middlewares: Set<Middleware>;
    mutator: (currentState: any, setStateArg: any) => any;
    unstable_concurrent:
      | boolean
      | ((notify: StoreState<any>['notify']) => void);
  };

  /**
   * @deprecated Batching is enabled by default in React 18+ and this API will be removed in next major
   */
  function batch(callback: () => any): void;

  type ContainerComponent<TProps> =
    | GenericContainerComponent<TProps>
    | OverrideContainerComponent<TProps>;

  type BaseContainerProps =
    | { scope?: string; isGlobal?: never }
    | { scope?: never; isGlobal?: boolean };

  interface GenericContainerComponent<TProps>
    extends FunctionComponent<PropsWithChildren<BaseContainerProps> & TProps> {
    override?: false;
  }

  interface OverrideContainerComponent<TProps>
    extends FunctionComponent<PropsWithChildren<BaseContainerProps> & TProps> {
    override: true;
  }

  type SubscriberComponent<
    TState,
    TActions,
    TProps = undefined
  > = ComponentType<
    {
      children: RenderPropComponent<TState, TActions>;
    } & TProps
  >;

  type HookFunction<TState, TActions, TArg = void> = (
    ...args: TArg extends unknown
      ? TArg extends undefined
        ? [TArg] | []
        : [TArg]
      : []
  ) => HookReturnValue<TState, TActions>;

  type HookActionsFunction<TActions> = () => TActions;

  type HookStateFunction<TState, TArg = undefined> = (
    ...args: TArg extends undefined ? [] : [TArg]
  ) => TState;

  /**
   * createStore
   */

  function createStore<
    TState extends object,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TContainerProps = unknown
  >(
    config:
      | {
          initialState: TState;
          actions: TActions;
          name?: string;
          unstable_concurrent?: boolean;
          containedBy?: never;
          handlers?: never;
        }
      | {
          initialState: TState;
          actions: TActions;
          name?: string;
          unstable_concurrent?: boolean;
          containedBy: GenericContainerComponent<TContainerProps>;
          handlers?: {
            onInit?: () => Action<TState, TContainerProps, any>;
            onUpdate?: () => Action<TState, TContainerProps, any>;
            onDestroy?: () => Action<TState, TContainerProps, any>;
            onContainerUpdate?: (
              nextProps: BaseContainerProps & TContainerProps,
              prevProps: BaseContainerProps & TContainerProps
            ) => Action<TState, TContainerProps, any>;
          };
        }
  ): Store<TState, TActions>;

  /**
   * createContainer
   */

  function createContainer<TContainerProps = unknown>(options?: {
    displayName?: string;
  }): GenericContainerComponent<TContainerProps>;
  function createContainer<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TContainerProps = unknown
  >(
    store: Store<TState, TActions>,
    options?: {
      onInit?: () => Action<TState, TContainerProps>;
      onUpdate?: () => Action<TState, TContainerProps>;
      onCleanup?: () => Action<TState, TContainerProps>;
      displayName?: string;
    }
  ): OverrideContainerComponent<TContainerProps>;

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
    TSubscriberProps = unknown
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

  function createActionsHook<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  >(
    store: Store<TState, TActions>
  ): HookActionsFunction<BoundActions<TState, TActions>>;

  function createStateHook<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TSelectedState = TState,
    THookArg = void
  >(
    store: Store<TState, TActions>,
    options?: {
      selector?: Selector<TState, THookArg, TSelectedState>;
    }
  ): HookStateFunction<TSelectedState, THookArg>;

  /**
   * createSelector
   */
  type InputSelector<ST, PR, SE> = (state: ST, props: PR) => SE;

  type OutputSelector<ST, PR, SE> = {
    (state: ST, props: PR, ...rest: any[]): SE;
    resultFunc(...args: any[]): SE;
    dependencies: any[];
  };

  function createSelector<ST, PR = void, SE = void, T1 = void>(
    selectors: [InputSelector<ST, PR, T1>],
    resultFn: (arg1: T1) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR = void, SE = void, T1 = void>(
    selector1: InputSelector<ST, PR, T1>,
    resultFn: (arg1: T1) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR = void, SE = void, T1 = void, T2 = void>(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    resultFn: (arg1: T1, arg2: T2) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<ST, PR = void, SE = void, T1 = void, T2 = void>(
    selectors: [InputSelector<ST, PR, T1>, InputSelector<ST, PR, T2>],
    resultFn: (arg1: T1, arg2: T2) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void
  >(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void
  >(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void
  >(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    selector4: InputSelector<ST, PR, T4>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void
  >(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>,
      InputSelector<ST, PR, T4>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void,
    T5 = void
  >(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    selector4: InputSelector<ST, PR, T4>,
    selector5: InputSelector<ST, PR, T5>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void,
    T5 = void
  >(
    selectors: [
      InputSelector<ST, PR, T1>,
      InputSelector<ST, PR, T2>,
      InputSelector<ST, PR, T3>,
      InputSelector<ST, PR, T4>,
      InputSelector<ST, PR, T5>
    ],
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void,
    T5 = void,
    T6 = void
  >(
    selector1: InputSelector<ST, PR, T1>,
    selector2: InputSelector<ST, PR, T2>,
    selector3: InputSelector<ST, PR, T3>,
    selector4: InputSelector<ST, PR, T4>,
    selector5: InputSelector<ST, PR, T5>,
    selector6: InputSelector<ST, PR, T6>,
    resultFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => SE
  ): OutputSelector<ST, PR, SE>;
  function createSelector<
    ST,
    PR = void,
    SE = void,
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void,
    T5 = void,
    T6 = void
  >(
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
