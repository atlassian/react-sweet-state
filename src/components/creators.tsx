import ContainerComponent from './container';
import SubscriberComponent from './subscriber';

const noop = () => () => {};
const defaultSelector = state => state;

export function createSubscriber<ST, AC, PR = {}>(
  Store,
  { selector = defaultSelector, displayName = '' } = {}
) {
  return class extends SubscriberComponent<ST, AC, PR> {
    static storeType = Store;
    static displayName = displayName || `Subscriber(${Store.key[0]})`;
    static selector = selector;
  };
}

export function createContainer<ST, AC, PR = {}>(
  Store,
  {
    onInit = noop,
    onUpdate = noop,
    displayName = '',
  }: {
    onInit?: () => (...args: any) => any;
    onUpdate?: () => (...args: any) => any;
    displayName?: string;
  } = {}
) {
  return class extends ContainerComponent<PR> {
    static storeType = Store;
    static displayName = displayName || `Container(${Store.key[0]})`;
    static hooks = { onInit, onUpdate };
  };
}
