import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { Context } from '../context';
import { StoreRegistry, bindActions } from '../store';

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
        handlers: {
          ...(onInit !== noop && { onInit: () => onInit() }),
          ...(onCleanup !== noop && { onDestroy: () => onCleanup() }),
          ...(onUpdate !== noop && { onContainerUpdate: () => onUpdate() }),
        },
      },
    });
  }

  return createFunctionContainer(StoreOrOptions);
}

function useRegistry(scope, isGlobal) {
  const { globalRegistry } = useContext(Context);

  return useMemo(() => {
    const isLocal = !scope && !isGlobal;
    return isLocal ? new StoreRegistry('__local__') : globalRegistry;
  }, [scope, isGlobal, globalRegistry]);
}

function useContainedStore(scope, registry, props, check, override) {
  // Store contained scopes in a map, but throwing it away on scope change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const containedStores = useMemo(() => new Map(), [scope]);

  // Store props in a ref to avoid re-binding actions when they change and re-rendering all
  // consumers unnecessarily. The update is handled by an effect on the component instead
  const propsRef = useRef();
  propsRef.current = props;

  const getContainedStore = useCallback(
    (Store, callsiteRetrieve) => {
      let containedStore = containedStores.get(Store);
      // first time it gets called we add store to contained map bound
      // so we can provide props to actions (only triggered by children)
      if (!containedStore) {
        const isExisting = registry.hasStore(Store, scope);
        const config = {
          props: () => propsRef.current,
          contained: check,
          retrieveStore: callsiteRetrieve,
        };
        const { storeState, actions } = registry.getStore(Store, scope, config);
        const handlers = bindActions(
          { ...Store.handlers, ...override?.handlers },
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
        // signal store is contained and ready now, so by the time
        // consumers subscribe we already have updated the store (if needed)
        if (!isExisting) handlers.onInit?.();
      }
      return containedStore;
    },
    [containedStores, registry, scope, check, override]
  );
  return [containedStores, getContainedStore];
}

function useApi(check, getContainedStore) {
  const { globalRegistry, retrieveStore } = useContext(Context);

  const retrieveRef = useRef();
  retrieveRef.current = (Store, callsiteRetrieve) =>
    check(Store)
      ? getContainedStore(Store, callsiteRetrieve)
      : retrieveStore(Store, callsiteRetrieve);

  // This api is "frozen", as changing it will trigger re-render across all consumers
  // so we link retrieveStore dynamically and manually call notify() on scope change
  return useMemo(
    () => ({
      globalRegistry,
      retrieveStore: (...args) => retrieveRef.current(...args),
    }),
    [globalRegistry]
  );
}

function createFunctionContainer({ displayName, override } = {}) {
  const check = (store) =>
    override
      ? store === override.Store
      : store.containedBy === FunctionContainer;

  function FunctionContainer({ children, scope, isGlobal, ...restProps }) {
    const registry = useRegistry(scope, isGlobal);
    const [containedStores, getContainedStore] = useContainedStore(
      scope,
      registry,
      restProps,
      check,
      override
    );
    const api = useApi(check, getContainedStore);

    // This listens for custom props change, and so we trigger container update actions
    // before the re-render gets to consumers, hence why memo and not effect
    useMemo(() => {
      containedStores.forEach(({ handlers }) => {
        handlers.onContainerUpdate?.();
      });
      // Deps are dynamic because we want to notify on any custom prop change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, Object.values(restProps).concat(containedStores));

    // This listens for scope change or component unmount, to notify all consumers
    // so all work is done on cleanup
    useEffect(() => {
      const cachedScope = scope;
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
                storeState ===
                  registry.getStore(Store, cachedScope, null)?.storeState
              ) {
                handlers.onDestroy?.();
                registry.deleteStore(Store, cachedScope);
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

  return FunctionContainer;
}
