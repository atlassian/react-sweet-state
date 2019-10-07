import { createHook } from './hook';

const defaultSelector = state => state;

export function createSubscriber(
  Store,
  { selector = defaultSelector, displayName = '' } = {}
) {
  const useStore = createHook(Store, { selector });
  const Subscriber = function({ children, ...rest }) {
    const [state, actions] = useStore(rest);
    return children(state, actions);
  };
  Subscriber.displayName = displayName || `Subscriber(${Store.key[0]})`;
  return Subscriber;
}
