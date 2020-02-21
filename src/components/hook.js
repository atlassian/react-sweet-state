import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useDebugValue,
} from 'react';
import { Context } from '../context';
import memoize from '../utils/memoize';
import shallowEqual from '../utils/shallow-equal';

const EMPTY_SELECTOR = () => undefined;
const DEFAULT_SELECTOR = state => state;

// As we want to subscribe ASAP and useEffect happens on next tick, but
// React currently throws a warning when using useLayoutEffect on the server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const useUnmount = fn => useIsomorphicLayoutEffect(() => fn, []);

// We memoize both the input and the output
// so if input args are shallow equal we do not recompute the selector
// and also when we do, check if output is shallow equal to prevent children update
const createMemoizedSelector = selector => {
  const memoSelector = memoize(selector);
  let lastResult;
  return (currentState, hookArg) => {
    const result = memoSelector(currentState, hookArg);
    if (!shallowEqual(result, lastResult)) {
      lastResult = result;
    }
    return lastResult;
  };
};

const handleStoreSubscription = (
  subscriptionRef,
  onUpdateRef = null,
  storeState = null
) => {
  if (subscriptionRef.current) {
    subscriptionRef.current.remove();
    subscriptionRef.current = null;
  }
  if (storeState && onUpdateRef) {
    // we call the current ref fn so state is fresh
    const onUpdate = (...args) => onUpdateRef.current(...args);
    subscriptionRef.current = {
      storeState,
      remove: storeState.subscribe(onUpdate),
    };
  }
};

export function createHook(Store, { selector } = {}) {
  return function useSweetState(propsArg) {
    const { getStore } = useContext(Context);
    const { storeState, actions } = getStore(Store);

    // If selector is not null, create a ref to the memoized version of it
    // Otherwise always return same value, as we ignore state
    const stateSelector = selector
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useMemo(() => createMemoizedSelector(selector), [])
      : selector === null
      ? EMPTY_SELECTOR
      : DEFAULT_SELECTOR;

    // At every render we get fresh state and using recent propsArg
    // we calculate the current value, to be used immediately
    const currentState = stateSelector(storeState.getState(), propsArg);
    useDebugValue(currentState);

    const [, triggerUpdate] = useState(0);
    const subscriptionRef = useRef(null);

    // We store update function into a ref and re-create on each render
    // so when called gets fresh currentState and props
    const onUpdateRef = useRef();
    onUpdateRef.current = (
      updStoreState = storeState.getState(),
      forceUpdate = false
    ) => {
      // if unsubscribed / unmounted do not set state
      if (!subscriptionRef.current) return;

      const nextState = stateSelector(updStoreState, propsArg);
      if (nextState !== currentState || forceUpdate) {
        // we need a different value on each update
        // otherwise React might optimise the state update and discard it!
        triggerUpdate(n => n + 0.1);
      }
    };

    // On first render or on scope change we subscribe
    // The inline subscription allows us to ensure:
    // - the order of updates is always top to bottom
    // - we get store updates since component inception
    // - we change subscription on scope change asap
    if (
      !subscriptionRef.current ||
      subscriptionRef.current.storeState !== storeState
    ) {
      handleStoreSubscription(subscriptionRef, onUpdateRef, storeState);
    }

    // On component unmount we unsubscribe to storeState updates
    useUnmount(() => handleStoreSubscription(subscriptionRef));

    return [currentState, actions];
  };
}
