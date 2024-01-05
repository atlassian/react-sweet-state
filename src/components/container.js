import React, {
  Component,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { Context } from '../context';
import { StoreRegistry, bindActions } from '../store';
import shallowEqual from '../utils/shallow-equal';
import defaults from '../defaults';

const noop = () => () => {};

export function createContainer(
  StoreOrOptions = {},
  { onInit = noop, onUpdate = noop, onCleanup = noop, displayName = '' } = {}
) {
  if ('key' in StoreOrOptions) {
    const Store = StoreOrOptions;
    const dn = displayName || `Container(${Store.key.split('__')[0]})`;

    return createFunctionContainer({
      displayName: dn,
      // compat fields
      override: {
        Store,
        handlers: Object.assign(
          {},
          onInit !== noop && { onInit: () => onInit() },
          onCleanup !== noop && { onDestroy: () => onCleanup() },
          // TODO: on next major pass through next/prev props args
          onUpdate !== noop && { onContainerUpdate: () => onUpdate() }
        ),
      },
    });
  }

  return createFunctionContainer(StoreOrOptions);
}

function useRegistry(scope, isGlobal, { globalRegistry }) {
  return useMemo(() => {
    const isLocal = !scope && !isGlobal;
    return isLocal ? new StoreRegistry('__local__') : globalRegistry;
  }, [scope, isGlobal, globalRegistry]);
}

function useContainedStore(scope, registry, propsRef, check, override) {
  // Store contained scopes in a map, but throwing it away on scope change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const containedStores = useMemo(() => new Map(), [scope]);

  const getContainedStore = useCallback(
    (Store) => {
      let containedStore = containedStores.get(Store);
      // first time it gets called we add store to contained map bound
      // so we can provide props to actions (only triggered by children)
      if (!containedStore) {
        const isExisting = registry.hasStore(Store, scope);
        const config = { props: () => propsRef.current.sub, contained: check };
        const { storeState } = registry.getStore(Store, scope, config);
        const actions = bindActions(Store.actions, storeState, config);
        const handlers = bindActions(
          Object.assign({}, Store.handlers, override?.handlers),
          storeState,
          config,
          actions
        );
        containedStore = {
          storeState,
          actions,
          handlers,
          unsubscribe: storeState.subscribe(() => handlers.onUpdate?.()),
        };
        containedStores.set(Store, containedStore);
        // Signal store is contained and ready now, so by the time
        // consumers subscribe we already have updated the store (if needed).
        // Also if override maintain legacy behaviour, triggered on every mount
        if (!isExisting || override) handlers.onInit?.();
      }
      return containedStore;
    },
    [containedStores, scope, registry, propsRef, check, override]
  );
  return [containedStores, getContainedStore];
}

function useApi(check, getContainedStore, { globalRegistry, retrieveStore }) {
  const retrieveRef = useRef();
  retrieveRef.current = (Store) =>
    check(Store) ? getContainedStore(Store) : retrieveStore(Store);

  // This api is "frozen", as changing it will trigger re-render across all consumers
  // so we link retrieveStore dynamically and manually call notify() on scope change
  return useMemo(
    () => ({ globalRegistry, retrieveStore: (s) => retrieveRef.current(s) }),
    [globalRegistry]
  );
}

function createFunctionContainer({ displayName, override } = {}) {
  const check = (store) =>
    override
      ? store === override.Store
      : store.containedBy === FunctionContainer ||
        store.containedBy === ClassContainer;

  function FunctionContainer(props) {
    const { children, ...restProps } = props;
    const { scope, isGlobal, ...subProps } = restProps;
    const ctx = useContext(Context);
    const registry = useRegistry(scope, isGlobal, ctx);

    // Store props in a ref to avoid re-binding actions when they change and re-rendering all
    // consumers unnecessarily. The update is handled by an effect on the component instead
    const propsRef = useRef({ prev: null, next: restProps, sub: subProps });
    propsRef.current = {
      prev: propsRef.current.next,
      next: restProps,
      sub: subProps, // TODO remove on next major
    };

    const [containedStores, getContainedStore] = useContainedStore(
      scope,
      registry,
      propsRef,
      check,
      override
    );

    // Use a stable object as is passed as value to context Provider
    const api = useApi(check, getContainedStore, ctx);

    // This listens for custom props change, and so we trigger container update actions
    // before the re-render gets to consumers (hence why side effect on render).
    // We do not use React hooks because num of restProps might change and react will throws
    if (!shallowEqual(propsRef.current.next, propsRef.current.prev)) {
      containedStores.forEach(({ handlers }) => {
        handlers.onContainerUpdate?.(
          propsRef.current.next,
          propsRef.current.prev
        );
      });
    }

    // We support renderding "bootstrap" containers without children with override API
    // so in this case we call getCS to initialize the store globally asap
    if (override && !containedStores.size && (scope || isGlobal)) {
      getContainedStore(override.Store);
    }

    // This listens for scope change or component unmount, to notify all consumers
    // so all work is done on cleanup
    useEffect(() => {
      return () => {
        containedStores.forEach(
          ({ storeState, handlers, unsubscribe }, Store) => {
            // Detatch container from subscription
            unsubscribe();
            // Trigger a forced update on all subscribers as we opted out from context
            // Some might have already re-rendered naturally, but we "force update" all anyway.
            // This is sub-optimal as if there are other containers with the same
            // old scope id we will re-render those too, but still better than context
            storeState.notify();
            // Given unsubscription is handled by useSyncExternalStore, we have no control on when
            // React decides to do it. So we schedule on next tick to run last
            Promise.resolve().then(() => {
              if (
                !storeState.listeners().size &&
                // ensure registry has not already created a new store with same scope
                storeState === registry.getStore(Store, scope, null)?.storeState
              ) {
                handlers.onDestroy?.();
                // We only delete scoped stores, as global shall persist and local are auto-deleted
                if (scope) registry.deleteStore(Store, scope);
              }
            });
          }
        );
        // no need to reset containedStores as the map is already bound to scope
      };
    }, [registry, scope, containedStores]);

    return <Context.Provider value={api}>{children}</Context.Provider>;
  }

  FunctionContainer.displayName = displayName || `Container`;
  FunctionContainer.propTypes = {
    children: PropTypes.node,
    scope: PropTypes.string,
    isGlobal: PropTypes.bool,
  };

  class ClassContainer extends Component {
    static displayName = displayName || `Container`;
    static propTypes = {
      children: PropTypes.node,
      scope: PropTypes.string,
      isGlobal: PropTypes.bool,
    };
    static contextType = Context;

    // This is only used to trigger store side effects on props change.
    // Doing it here, we can update children straight away, without a double render
    // Unfortunately, functional components do not have an equivalent API
    static getDerivedStateFromProps({ children, ...props }, state) {
      if (state.containedStores && !shallowEqual(props, state.prevProps)) {
        // mutate props so it is available immediately in actions
        state.nextProps = props;
        state.containedStores.forEach(({ handlers }) => {
          handlers.onContainerUpdate?.(state.nextProps, state.prevProps);
        });
      }
      return null;
    }

    state = {
      registry: null,
      prevProps: null,
      nextProps: null,
      containedStores: null,
      api: null,
    };

    getContainedStore(Store) {
      const { scope } = this.state.nextProps;

      let containedStore = this.state.containedStores.get(Store);
      // first time it gets called we add store to contained map bound
      // so we can provide props to actions (only triggered by children)
      if (!containedStore) {
        const isExisting = this.state.registry.hasStore(Store, scope);
        const config = { props: this.getSubProps, contained: check };
        const { storeState } = this.state.registry.getStore(
          Store,
          scope,
          config
        );
        const actions = bindActions(Store.actions, storeState, config);
        const handlers = bindActions(
          Object.assign({}, Store.handlers, override?.handlers),
          storeState,
          config,
          actions
        );
        containedStore = {
          storeState,
          actions,
          handlers,
          unsubscribe: storeState.subscribe(() => handlers.onUpdate?.()),
        };
        this.state.containedStores.set(Store, containedStore);
        // Signal store is contained and ready now, so by the time
        // consumers subscribe we already have updated the store (if needed).
        // Also if override maintain legacy behaviour, triggered on every mount
        if (!isExisting || override) handlers.onInit?.();
      }
      return containedStore;
    }

    initState(isLocal) {
      const { children, ...props } = this.props;
      // mutate state during render: not recommended but only way to get context
      this.state = {
        registry: isLocal
          ? new StoreRegistry('__local__')
          : this.context.globalRegistry,
        prevProps: props,
        nextProps: props,
        containedStores: new Map(),
        api: {
          globalRegistry: this.context.globalRegistry,
          retrieveStore: (s) =>
            check(s)
              ? this.getContainedStore(s)
              : this.context.retrieveStore(s),
        },
      };
    }

    getSubProps = () => {
      // get from nextProps to have them fresh in onContainerUpdate too
      const { scope, isGlobal, ...subProps } = this.state.nextProps;
      return subProps;
    };

    handleCleanup(scope, { containedStores, registry }) {
      containedStores.forEach(
        ({ storeState, handlers, unsubscribe }, Store) => {
          // Detatch container from subscription
          unsubscribe();
          // Trigger a forced update on all subscribers as we opted out from context
          // Some might have already re-rendered naturally, but we "force update" all anyway.
          // This is sub-optimal as if there are other containers with the same
          // old scope id we will re-render those too, but still better than context
          storeState.notify();
          // Given unsubscription is handled by useSyncExternalStore, we have no control on when
          // React decides to do it. So we schedule on next tick to run last
          Promise.resolve().then(() => {
            if (
              !storeState.listeners().size &&
              // ensure registry has not already created a new store with same scope
              storeState === registry.getStore(Store, scope, null)?.storeState
            ) {
              handlers.onDestroy?.();
              // We only delete scoped stores, as global shall persist and local are auto-deleted
              if (scope) registry.deleteStore(Store, scope);
            }
          });
        }
      );
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.scope !== this.props.scope) {
        this.handleCleanup(prevProps.scope, prevState);
      }
    }

    componentWillUnmount() {
      this.handleCleanup(this.props.scope, this.state);
    }

    render() {
      // This is not ideal but context is not available on constructor
      // so we initialize the state on first render (or reset on scope change)
      if (
        !this.state.prevProps ||
        this.state.prevProps.scope !== this.props.scope
      ) {
        const isLocal = !this.props.scope && !this.props.isGlobal;
        this.initState(isLocal);

        // We support renderding "bootstrap" containers without children with override API
        // so in this case we call getCS to initialize the store globally asap
        if (override && !isLocal) {
          this.getContainedStore(override.Store);
        }
      }

      return (
        <Context.Provider value={this.state.api}>
          {this.props.children}
        </Context.Provider>
      );
    }
  }

  return defaults.batchUpdates === false || defaults.unstable_concurrent != null
    ? ClassContainer
    : FunctionContainer;
}
