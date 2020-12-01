import defaults from '../defaults';
import update from './update';

const applyMiddleware = (storeState, middlewares) =>
  Array.from(middlewares)
    .concat(update)
    .reduceRight((next, mw) => mw(storeState)(next), defaults.mutator);

export default applyMiddleware;
