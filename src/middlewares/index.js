import defaults from '../defaults';
import batch from './batch';
import update from './update';

const applyMiddleware = (storeState, middlewares) =>
  [...middlewares, batch, update].reduceRight(
    (next, mw) => mw(storeState)(next),
    defaults.mutator
  );

export default applyMiddleware;
