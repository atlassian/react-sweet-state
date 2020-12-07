// @flow

import { type Action } from 'react-sweet-state';
import type { TodoModel, State } from './types';

// Dummy data
const TODOS: { [id: string]: TodoModel[] } = {
  '1': [{ title: 'Buy veggies' }, { title: 'Wash bicycle' }],
  '2': [{ title: 'Do the dishes' }],
};

export const load = (uid: string): Action<State> => async ({
  setState,
  getState,
}) => {
  if (getState().loading) return;

  setState({
    loading: true,
    data: null, // reset
  });
  // simulate async call
  await new Promise((r) => setTimeout(r, 1000));
  setState({
    loading: false,
    data: TODOS[uid],
  });
};
