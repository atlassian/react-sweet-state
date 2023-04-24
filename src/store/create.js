import hash from '../utils/hash';

function createKey(initialState, actions, name) {
  const src = !name
    ? Object.keys(actions).reduce((acc, k) => acc + actions[k].toString(), '')
    : '';
  return [name, hash(src + JSON.stringify(initialState))]
    .filter(Boolean)
    .join('__');
}

export function createStore({ name = '', initialState, actions, tags }) {
  let key;
  return {
    name,
    get key() {
      // lazy evaluate key on first access
      return key || (key = createKey(initialState, actions, name));
    },
    initialState,
    actions,
    tags,
  };
}
