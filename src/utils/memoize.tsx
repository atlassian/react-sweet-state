// Mostly copied from https://github.com/alexreardon/memoize-one
// manually optimised shallow check 2 args

import shallowEqual from './shallow-equal';

// Shallow comparing 2 arguments, so if arg objects instances are different
// but contents are the same we still get the memoized value
const argumentsEqual = (newArgs, lastArgs) =>
  shallowEqual(newArgs[0], lastArgs[0]) &&
  shallowEqual(newArgs[1], lastArgs[1]);

export default function(resultFn) {
  let lastArgs = [];
  let lastResult;
  let calledOnce = false;

  const result = function(argA, argB) {
    const newArgs = [argA, argB];
    if (calledOnce && argumentsEqual(newArgs, lastArgs)) {
      return lastResult;
    }

    lastResult = resultFn.apply(this, newArgs);
    calledOnce = true;
    lastArgs = newArgs;
    return lastResult;
  };

  return result;
}
