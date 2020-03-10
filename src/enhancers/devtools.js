import defaults from '../defaults';

const connectDevTools = storeState => {
  const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
    name: `Store ${storeState.key}`,
    serialize: true,
  });
  devTools.init(storeState.getState());
  devTools.subscribe(message => {
    if (message.type === 'DISPATCH') {
      switch (message.payload.type) {
        case 'RESET':
          storeState.resetState();
          devTools.init(storeState.getState());
          return;
        case 'COMMIT':
          devTools.init(storeState.getState());
          return;
        case 'ROLLBACK':
          storeState.setState(JSON.parse(message.state));
          devTools.init(storeState.getState());
          return;
        case 'JUMP_TO_STATE':
        case 'JUMP_TO_ACTION':
          storeState.setState(JSON.parse(message.state));
          return;
      }
    } else if (message.type === 'ACTION') {
      let action = JSON.parse(message.payload);
      storeState.setState(action.payload);
    }
  });
  return devTools;
};

const withDevtools = createStoreState => (...args) => {
  const storeState = createStoreState(...args);

  if (defaults.devtools && window && window.__REDUX_DEVTOOLS_EXTENSION__) {
    const origMutator = storeState.mutator;
    let devTools;
    const devtoolMutator = arg => {
      const result = origMutator(arg);
      try {
        if (!devTools) {
          devTools = connectDevTools(storeState);
        }
        devTools.send(
          { type: storeState.mutator.actionName, payload: arg },
          storeState.getState(),
          {},
          storeState.key
        );
      } catch (err) {
        /* ignore devtools errors */
      }
      return result;
    };
    storeState.mutator = devtoolMutator;
  }

  return storeState;
};

export default withDevtools;
