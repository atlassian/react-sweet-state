declare module "react-sweet-state" {
  import { ComponentType, ReactNode, ReactElement } from "react";

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

  type ActionThunk<TState, TActions> = (...args: any[]) => Action<TState>;

  export type Store<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>
  > = {
    key: string[];
    initialState: TState;
    actions: TActions;
  };

  export type StoreState<TState> = {
    getState: GetState<TState>;
    setState: SetState<TState>;
    key: string[];
    subscribe: (listener: () => void) => StoreUnsubscribe;
    mutator: SetState<TState>;
  };

  export type Action<TState, TContainerProps = void, TActions = any> = (
    state: {
      setState: SetState<TState>;
      getState: GetState<TState>;
      actions: TActions;
      dispatch: (actionThunk: Action<TState, TContainerProps, TActions>) => any;
    },
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

  export interface StoreInstance<TState, TActions> {
    store: StoreState<TState>;
    actions: TActions;
  }

  export class Registry {
    configure(options: { initialStates?: { [key: string]: Object } }): void;
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

  export var defaultRegistry: Registry;

  type MiddlewareResult = any;
  export type Middleware = (
    store: StoreState<any>
  ) => (
    next: (fn: any) => MiddlewareResult
  ) => (fn: () => any) => MiddlewareResult;

  export var defaults: {
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

  export function createStore<
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

  export function createContainer<
    TState,
    TActions extends Record<string, ActionThunk<TState, TActions>>,
    TProps = {}
  >(
    store: Store<TState, TActions>,
    options?: {
      onInit?: () => Action<TState, TProps, TActions>;
      onUpdate?: () => Action<TState, TProps, TActions>;
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

  export function createSubscriber<
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

  export function createHook<
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
    ...args: TArg extends void ? [] : [TArg]
  ) => [TSelectedState, BoundActions<TState, TActions>];
}
