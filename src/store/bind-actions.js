import defaults from '../defaults';

const namedMutator = (storeState, actionName) => (...arg) => {
  storeState.mutator.actionName = actionName;
  return storeState.mutator(...arg);
};

export const bindAction = (
  storeState,
  actionFn,
  actionKey,
  getContainerProps = () => {},
  otherActions = {}
) => {
  // Setting mutator name so we can log action name for better debuggability
  const dispatch = (thunkFn, actionName = `${actionKey}.dispatch`) =>
    thunkFn(
      {
        setState: defaults.devtools
          ? namedMutator(storeState, actionName)
          : storeState.mutator,
        getState: storeState.getState,
        actions: otherActions,
        dispatch,
      },
      getContainerProps()
    );
  return (...args) => dispatch(actionFn(...args), actionKey);
};

export const bindActions = (
  actions,
  storeState,
  getContainerProps = () => ({})
) =>
  Object.keys(actions).reduce((acc, k) => {
    acc[k] = bindAction(storeState, actions[k], k, getContainerProps, actions);
    return acc;
  }, {});
