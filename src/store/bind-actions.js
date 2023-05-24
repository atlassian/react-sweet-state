import defaults from '../defaults';

const namedMutator =
  (storeState, actionName) =>
  (...arg) => {
    storeState.mutator.actionName = actionName;
    return storeState.mutator(...arg);
  };

const warnings = new WeakMap();

export const bindAction = (
  storeState,
  actionFn,
  actionKey,
  config,
  actions
) => {
  const callThunk = (instance, thunkFn, actionName) =>
    thunkFn(
      {
        setState: defaults.devtools
          ? namedMutator(instance.storeState, actionName)
          : instance.storeState.mutator,
        getState: instance.storeState.getState,
        get actions() {
          if (!warnings.has(actionFn)) {
            warnings.set(
              actionFn,
              console.warn(
                `react-sweet-state 'actions' property has been deprecated and will be removed in the next mayor. ` +
                  `Please check action '${actionName}' of Store '${instance.storeState.key}' and use 'dispatch' instead`
              )
            );
          }

          return actions;
        },
        dispatch: (tFn) => callThunk(instance, tFn, `${actionName}.dispatch`),
      },
      config.props()
    );
  return (...args) =>
    callThunk({ storeState, actions }, actionFn(...args), actionKey);
};

export const bindActions = (actions, storeState, config, boundActions = null) =>
  Object.keys(actions).reduce((acc, k) => {
    acc[k] = bindAction(storeState, actions[k], k, config, boundActions || acc);
    return acc;
  }, {});
