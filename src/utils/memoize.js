import shallowEqual from './shallow-equal';

function exactEqual(objA, objB) {
  return objA === objB;
}

function areArgumentsEqual(propsMode, prev, next) {
  if (prev === null || next === null || prev.length !== next.length)
    return false;

  // If propsMode and 2 arguments, means it is an input selector
  // and we check for shallow equality on 2nd one to optimise props
  if (propsMode && prev.length === 2) {
    return prev[0] === next[0] && shallowEqual(prev[1], next[1]);
  }

  for (let i = 0; i < prev.length; i++) {
    if (!exactEqual(prev[i], next[i])) return false;
  }

  return true;
}

/**
 * Tailor made memoisation
 */
export default function(resultFn, propsMode = false) {
  let lastArgs = [];
  let lastResult;
  let calledOnce = false;

  const result = function() {
    if (calledOnce && areArgumentsEqual(propsMode, arguments, lastArgs)) {
      return lastResult;
    }

    const nextResult = resultFn.apply(this, arguments);
    if (!propsMode && shallowEqual(nextResult, lastResult)) {
      return lastResult;
    }

    lastResult = nextResult;
    calledOnce = true;
    lastArgs = arguments;
    return lastResult;
  };

  return result;
}
