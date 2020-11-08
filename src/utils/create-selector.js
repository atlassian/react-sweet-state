import memoize from './memoize';

// customised version of reselect

export function createSelector(...funcs) {
  const resultFunc = funcs.pop();
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  const memoizedResultFunc = memoize(function() {
    return resultFunc.apply(null, arguments);
  });

  // this memoisation is optimised for 2 arguments (state, props)
  const selector = memoize(function() {
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
