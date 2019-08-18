// @flow

import { type StoreActionApi } from 'react-sweet-state';
import type { TodoModel, State } from './types';

// Dummy data
const TODOS: { [id: string]: TodoModel[] } = {
  '1': [{ title: 'Buy veggies' }, { title: 'Wash bicycle' }],
  '2': [{ title: 'Do the dishes' }],
};

export const load = (uid: string) => async ({
  setState,
  getState,
}: StoreActionApi<State>) => {
  if (getState().loading) return;

  setState({
    loading: true,
    data: null, // reset
  });
  // simulate async call
  await new Promise(r => setTimeout(r, 1000));
  setState({
    loading: false,
    data: TODOS[uid],
  });
};
