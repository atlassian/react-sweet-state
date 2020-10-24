// Mostly copied from fbjs/packages/fbjs/src/core/shallowEqual.js
// enhanced with keys cache as might get called multiple times with same args

const hasOwnProperty = Object.prototype.hasOwnProperty;
const CACHE = new WeakMap();

export default function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  let keysA;
  if (CACHE.has(objA)) {
    keysA = CACHE.get(objA);
  } else {
    keysA = Object.keys(objA);
    CACHE.set(objA, keysA);
  }

  let keysB;
  if (CACHE.has(objB)) {
    keysB = CACHE.get(objB);
  } else {
    keysB = Object.keys(objB);
    CACHE.set(objB, keysB);
  }

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      objA[keysA[i]] !== objB[keysA[i]]
    ) {
      return false;
    }
  }

  return true;
}
