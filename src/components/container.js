import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../context';
import { StoreRegistry, bindActions, defaultRegistry } from '../store';
import shallowEqual from '../utils/shallow-equal';

const noop = () => () => {};

export default class Container extends Component {
  static propTypes = {
    children: PropTypes.node,
    scope: PropTypes.string,
    isGlobal: PropTypes.bool,
  };

  static storeType = null;
  static hooks = null;
  static contextType = Context;

  static getDerivedStateFromProps(nextProps, prevState) {
    const { scope } = nextProps;
    const hasScopeChanged = scope !== prevState.scope;

    let nextState = null;
    if (hasScopeChanged) {
      const actions = prevState.bindContainerActions(scope);
      nextState = {
        scope,
        scopedActions: actions,
      };
    }
    // We trigger the action here so subscribers get new values ASAP
    prevState.triggerContainerAction(nextProps);
    return nextState;
  }

  constructor(props, context) {
    super(props, context);

    const {
      // These fallbacks are needed only to make enzyme shallow work
      // as it does not fully support provider-less Context enzyme#1553
      globalRegistry = defaultRegistry,
      getStore = defaultRegistry.getStore,
    } = this.context;

    this.state = {
      api: {
        globalRegistry,
        getStore: (Store, scope) =>
          this.constructor.storeType === Store
            ? this.getScopedStore(scope)
            : getStore(Store),
      },
      // stored to make them available in getDerivedStateFromProps
      // as js context there is null https://github.com/facebook/react/issues/12612
      bindContainerActions: this.bindContainerActions,
      triggerContainerAction: this.triggerContainerAction,
      scope: props.scope,
    };
    this.state.scopedActions = this.bindContainerActions(props.scope);
  }

  registry = new StoreRegistry('__local__');
  scopedHooks = {};

  componentDidUpdate(prevProps) {
    if (this.props.scope !== prevProps.scope) {
      const { storeState } = this.getScopedStore(prevProps.scope);
      // Trigger a forced update on all subscribers as render might have been blocked
      // When called, subscribers that have already re-rendered with the new scope
      // are no longer subscribed to the old one, so we "force update" the remaining.
      // This is sub-optimal as if there are other containers with the same
      // old scope id we will re-render those too, but still better than using context
      storeState.notify();
      // Schedule check if instance has still subscribers, if not delete
      Promise.resolve().then(() => {
        this.deleteScopedStore(storeState, prevProps.scope);
      });
    }
  }

  componentWillUnmount() {
    let scopedStore = this.props.scope ? this.getScopedStore() : null;
    // schedule on next tick as this is called by React before useEffect cleanup
    // so if we run immediately listeners will still be there and run
    Promise.resolve().then(() => {
      this.scopedHooks.onCleanup();
      // Check if scope has still subscribers, if not delete
      if (scopedStore) this.deleteScopedStore(scopedStore.storeState);
    });
  }

  bindContainerActions = (scope) => {
    const { storeType, hooks } = this.constructor;
    const { api } = this.state;
    // we explicitly pass scope as it might be changed
    const { storeState } = api.getStore(storeType, scope);

    const actions = bindActions(
      storeType.actions,
      storeState,
      this.getContainerProps
    );

    this.scopedHooks = bindActions(
      hooks,
      storeState,
      this.getContainerProps,
      actions
    );

    // make sure we also reset actionProps
    this.actionProps = null;
    return actions;
  };

  triggerContainerAction = (nextProps) => {
    const nextActionProps = this.filterActionProps(nextProps);
    const prevActionProps = this.actionProps;
    if (shallowEqual(prevActionProps, nextActionProps)) return;

    // store restProps on instance so we can diff and use fresh props
    // in actions even before react sets them in this.props
    this.actionProps = nextActionProps;

    if (this.scopedHooks.onInit) {
      this.scopedHooks.onInit();
      this.scopedHooks.onInit = null;
    } else {
      this.scopedHooks.onUpdate();
    }
  };

  filterActionProps = (props) => {
    // eslint-disable-next-line no-unused-vars
    const { children, scope, isGlobal, ...restProps } = props;
    return restProps;
  };

  getContainerProps = () => this.actionProps;

  getRegistry() {
    const isLocal = !this.props.scope && !this.props.isGlobal;
    return isLocal ? this.registry : this.state.api.globalRegistry;
  }

  getScopedStore(scopeId = this.props.scope) {
    const { storeType } = this.constructor;
    const { storeState } = this.getRegistry().getStore(storeType, scopeId);
    // instead of returning global bound actions
    // we return the ones with the countainer props binding
    return {
      storeState,
      actions: this.state.scopedActions,
    };
  }

  deleteScopedStore(prevStoreState, scopeId = this.props.scope) {
    const { storeState } = this.getScopedStore(scopeId);
    if (
      scopeId != null &&
      !prevStoreState.listeners().length &&
      // ensure registry has not already created a new store w/ same scope
      prevStoreState === storeState
    ) {
      const { storeType } = this.constructor;
      this.getRegistry().deleteStore(storeType, scopeId);
    }
  }

  render() {
    const { children } = this.props;
    return (
      <Context.Provider value={this.state.api}>{children}</Context.Provider>
    );
  }
}

export function createContainer(
  Store,
  { onInit = noop, onUpdate = noop, onCleanup = noop, displayName = '' } = {}
) {
  return class extends Container {
    static storeType = Store;
    static displayName =
      displayName || `Container(${Store.key.split('__')[0]})`;
    static hooks = { onInit, onUpdate, onCleanup };
  };
}
