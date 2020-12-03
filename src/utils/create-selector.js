import memoize from './memoize';

// customised version of reselect

export function createSelector(...funcs) {
  const resultFunc = funcs.pop();
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  const memoizedResultFunc = memoize(function () {
    return resultFunc.apply(null, arguments);
  });

  // this memoisation is optimised for 2 arguments (state, props)
  const selector = memoize(function () {
    // calculate all dependencies results
    const params = [];
    for (let i = 0; i < dependencies.length; i++) {
      params.push(dependencies[i].apply(null, arguments));
    }
    // then call the final func with all them as arguments
    return memoizedResultFunc.apply(null, params);
  }, true);

  // expose so we can create per scope selectors
  // API compatible with reselect@^4
  selector.resultFunc = resultFunc;
  selector.dependencies = dependencies;
  return selector;
}

export function createMemoizedSelector(selector) {
  const isReselector =
    typeof selector.resultFunc === 'function' &&
    Array.isArray(selector.dependencies);
  const dependencies = isReselector
    ? selector.dependencies
    : [(s) => s, (_, p) => p];
  const resultFunc = isReselector ? selector.resultFunc : selector;
  return createSelector(dependencies, resultFunc);
}

const cache = new WeakMap();

export function getSelectorInstance(selector, storeState, hasProps) {
  if (!hasProps) {
    if (!cache.has(storeState)) {
      cache.set(storeState, new WeakMap());
    }
    const scopeSelectors = cache.get(storeState);

    if (!scopeSelectors.has(selector)) {
      scopeSelectors.set(selector, createMemoizedSelector(selector));
    }
    return scopeSelectors.get(selector);
  }
  return createMemoizedSelector(selector);
}
