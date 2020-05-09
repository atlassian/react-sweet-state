import { unstable_batchedUpdates as batch } from '../utils/batched-updates';

/**
 * Batch calls to listeners so react can update all in one go, top down
 */
const batchMiddleware = () => next => arg => {
  let output;
  batch(() => {
    output = next(arg);
  });
  return output;
};

export default batchMiddleware;
