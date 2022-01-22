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
  getContainerProps = () => {},
  boundActions = {}
) => {
  // Setting mutator name so we can log action name for better debuggability
  const dispatch = (thunkFn, actionName = `${actionKey}.dispatch`) =>
    thunkFn(
      {
        setState: defaults.devtools
          ? namedMutator(storeState, actionName)
          : storeState.mutator,
        getState: storeState.getState,
        get actions() {
          if (!warnings.has(actionFn)) {
            warnings.set(
              actionFn,
              console.warn(
                `react-sweet-state 'actions' property has been deprecated and will be removed in the next mayor. ` +
                  `Please check action '${actionName}' of Store '${storeState.key}' and use 'dispatch' instead`
              )
            );
          }

          return boundActions;
        },
        dispatch,
      },
      getContainerProps()
    );
  return (...args) => dispatch(actionFn(...args), actionKey);
};

export const bindActions = (
  actions,
  storeState,
  getContainerProps = () => ({}),
  boundActions = null
) =>
  Object.keys(actions).reduce((acc, k) => {
    acc[k] = bindAction(
      storeState,
      actions[k],
      k,
      getContainerProps,
      boundActions || acc
    );
    return acc;
  }, {});
