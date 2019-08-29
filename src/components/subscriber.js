import { Component } from 'react';
import PropTypes from 'prop-types';

import { readContext } from '../context';
import memoize from '../utils/memoize';
import shallowEqual from '../utils/shallow-equal';

export default class Subscriber extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
  };

  static storeType = null;
  static selector;

  static getDerivedStateFromProps(nextProps, prevState) {
    // Get fresh state at every re-render, so if a parent triggers
    // a re-render before the component subscription calls onUpdate()
    // we already serve the updated state and skip the additional render
    const nextStoreStateValue = prevState.getStoreStateValue(nextProps, true);
    return { storeStateValue: nextStoreStateValue };
  }

  store = null;
  subscription = null;
  mounted = false;
  selector = this.constructor.selector && memoize(this.constructor.selector);

  constructor(props) {
    super(props);
    this.state = {
      storeStateValue: undefined,
      // stored to make them available in getDerivedStateFromProps
      // as js context there is null https://github.com/facebook/react/issues/12612
      getStoreStateValue: this.getStoreStateValue,
    };
  }

  componentDidMount() {
    this.mounted = true;

    // Moreover, when async render, state could change between render and mount
    // so to ensure state is fresh we should manually call onUpdate and
    // potentially causing a de-opts to synchronous rendering (should be rare)
    // https://github.com/facebook/react/issues/13186#issuecomment-403959161
    this.onUpdate();
  }

  componentWillUnmount() {
    this.store = null;
    this.mounted = false;
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  getStoreStateValue = (nextProps = this.props, fromContext = false) => {
    // eslint-disable-next-line no-unused-vars
    const { children, ...props } = nextProps;
    // We can get stores from context ONLY during rendering phase
    // overwise React will return the default ctx value!
    const store = fromContext ? this.getStoreFromContext() : this.store;

    // if component is initialising or if scope has changed
    if (!this.store || store.storeState !== this.store.storeState) {
      this.store = store;
      this.subscribeToUpdates();
    }

    const currentStoreState = this.store.storeState.getState();
    return this.selector
      ? this.selector(currentStoreState, props)
      : this.selector === null
      ? undefined
      : currentStoreState;
  };

  getStoreFromContext() {
    const { storeType } = this.constructor;
    // We use React context just to get the stores registry
    // then we rely on our internal pub/sub to get updates
    // because context API doesn't have builtin selectors (yet).
    const ctx = readContext();
    return ctx.getStore(storeType);
  }

  subscribeToUpdates() {
    const { storeState } = this.store;
    // in case store has been recreated during an update (due to scope change)
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.subscription = {
      storeState,
      remove: storeState.subscribe(this.onUpdate),
    };
  }

  onUpdate = (updState, forceUpdate) => {
    // Ensure only gets update when component is mounted
    if (!this.mounted) return;
    // Ensure component is still mounted and has a store attached
    if (!this.store) return;
    const prevStoreStateValue = this.state.storeStateValue;
    const nextStoreStateValue = this.getStoreStateValue();
    // Only update if state changed or if container triggered
    if (
      !shallowEqual(prevStoreStateValue, nextStoreStateValue) ||
      forceUpdate
    ) {
      // nextState will recalculated by gDSFP anyway
      this.setState({ storeStateValue: nextStoreStateValue });
    }
  };

  render() {
    // this is needed for compat with React<16.5
    // as gDSFP in not called before first render
    const storeStateValue = this.store
      ? this.state.storeStateValue
      : this.getStoreStateValue(this.props, true);
    return this.props.children(storeStateValue, this.store.actions);
  }
}
