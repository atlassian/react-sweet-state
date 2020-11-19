import { createHook } from './hook';

function hasAdditionalProps(props) {
  for (let i in props) return true;
  return false;
}

export function createSubscriber(Store, { selector, displayName = '' } = {}) {
  const useStore = createHook(Store, { selector });
  const Subscriber = function({ children, ...rest }) {
    const api = useStore(hasAdditionalProps(rest) ? rest : undefined);
    return children(...api);
  };
  Subscriber.displayName = displayName || `Subscriber(${Store.key[0]})`;
  return Subscriber;
}
