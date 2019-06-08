import defaults from '../defaults';
import update from './update';

const applyMiddleware = (storeState, middlewares) =>
  [...middlewares, update]
    .reverse()
    .reduce((next, mw) => mw(storeState)(next), defaults.mutator);

export default applyMiddleware;
