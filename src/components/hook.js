import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { readContext } from '../context';
import memoize from '../utils/memoize';
import shallowEqual from '../utils/shallow-equal';

const EMPTY_SELECTOR = () => undefined;
const DEFAULT_SELECTOR = state => state;

// As we want to subscribe ASAP and useEffect happens on next tick, but
// React currently throws a warning when using useLayoutEffect on the server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function createHook(Store, { selector } = {}) {
  return function(props) {
    // instead of using "useContext" we get the context value with
    // a custom implementation so our components do not render on ctx change
    const ctx = readContext();
    const { storeState, actions } = ctx.getStore(Store);

    // If selector is not null, create a ref to the memoized version of it
    // Otherwise always return same value, as we ignore state
    const stateSelector = selector
      ? useCallback(memoize(selector), [])
      : selector === null
      ? EMPTY_SELECTOR
      : DEFAULT_SELECTOR;

    const currentState = stateSelector(storeState.getState(), props);
    let [prevState, setState] = useState(currentState);

    // We store update function into a ref so when called has fresh state
    // React setState in useEffect provides a stale state unless we re-subscribe
    // https://github.com/facebook/react/issues/14042
    const onUpdateRef = useRef();
    onUpdateRef.current = (updState = prevState, forceUpdate) => {
      const nextState = stateSelector(updState, props);
      if (!shallowEqual(nextState, currentState) || forceUpdate) {
        setState(nextState);
      }
    };

    const unsubRef = useRef();

    const registerUpdateFn = () => {
      if (unsubRef.current) {
        return;
      }

      // we call the current ref fn so state is fresh
      const onUpdate = (...args) => onUpdateRef.current(...args);
      // after component is mounted or store changed, we subscribe
      const unsubscribe = storeState.subscribe(onUpdate);
      unsubRef.current = unsubscribe;
    }

    const [_, setUpdateFn] = useState(registerUpdateFn)

    // if we detect that state has changed, we shedule an immediate re-render
    // (as suggested by react docs https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops)
    // still, it feels silly
    if (prevState !== currentState) {
      setState(currentState);
    }

    useIsomorphicLayoutEffect(() => {
      setUpdateFn(registerUpdateFn);

      return () => {
        // fired on unmount or every time store changes
        unsubRef.current();
        unsubRef.current = null;
      };
    }, [storeState]);

    return [currentState, actions];
  };
}
