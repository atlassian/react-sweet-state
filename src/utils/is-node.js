/* global process */

let isNode;

export default function isNodeEnv() {
  if (isNode === undefined) {
    isNode =
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null;
  }

  return isNode;
}
