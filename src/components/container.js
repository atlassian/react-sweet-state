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
          this.getScopedStore(Store, scope) || getStore(Store),
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
      // Trigger a forced update on all subscribers
      // as render might have been blocked
      this.triggerScopeChange(prevProps.scope, this.props.scope);
      // Check if instance has still subscribers, if not delete
      this.deleteScopedStore(prevProps.scope);
    }
  }

  componentWillUnmount() {
    // schedule on next tick as this is called by React before useEffect cleanup
    // so if we run immediately listeners will still be there and run
    Promise.resolve().then(() => {
      this.scopedHooks.onCleanup();
      // Check if scope has still subscribers, if not delete
      this.deleteScopedStore();
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
    // eslint-disable-next-line no-unused-vars
    const { children, scope, isGlobal, ...restProps } = nextProps;
    if (shallowEqual(this.actionProps, restProps)) return;

    // store restProps on instance so we can diff and use fresh props
    // in actions even before react sets them in this.props
    this.actionProps = restProps;

    if (this.scopedHooks.onInit) {
      this.scopedHooks.onInit();
      this.scopedHooks.onInit = null;
    } else {
      this.scopedHooks.onUpdate();
    }
  };

  getContainerProps = () => this.actionProps;

  getRegistry() {
    const isLocal = !this.props.scope && !this.props.isGlobal;
    return isLocal ? this.registry : this.state.api.globalRegistry;
  }

  getScopedStore(Store, scopeId = this.props.scope) {
    const { storeType } = this.constructor;
    if (Store !== storeType) {
      return null;
    }
    const { storeState } = this.getRegistry().getStore(Store, scopeId);
    // instead of returning global bound actions
    // we return the ones with the countainer props binding
    return {
      storeState,
      actions: this.state.scopedActions,
    };
  }

  triggerScopeChange(prevScopeId, scopeId) {
    const { storeType } = this.constructor;
    const previous = this.getScopedStore(storeType, prevScopeId);
    const current = this.getScopedStore(storeType, scopeId);
    // When called, subscribers that have already re-rendered with the new
    // scope are no longer subscribed to the old one, so we "force update"
    // the remaining.
    // This is sub-optimal as if there are other containers with the same
    // old scope id we will re-render those too, but better than using context
    // as that will re-render all children even if pure/memo
    previous.storeState.notify(current.storeState);
  }

  deleteScopedStore(scopeId = this.props.scope) {
    const { storeType } = this.constructor;
    const { storeState } = this.getScopedStore(storeType, scopeId);
    if (scopeId != null && !storeState.listeners().length) {
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
    static displayName = displayName || `Container(${Store.key[0]})`;
    static hooks = { onInit, onUpdate, onCleanup };
  };
}
