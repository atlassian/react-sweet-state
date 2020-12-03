// @flow
import { type Action } from 'react-sweet-state';
import type { UserModel, State } from './types';

// Dummy data
const USERS: UserModel[] = [
  { id: '1', name: 'Bob' },
  { id: '2', name: 'Paul' },
];

export const setLoading = (): Action<State> => ({ setState }) => {
  setState({
    loading: true,
  });
};

export const load = (): Action<State> => async ({
  setState,
  getState,
  dispatch,
}) => {
  if (getState().loading) return;
  dispatch(setLoading());
  // simulate async call
  await new Promise((r) => setTimeout(r, 1000));
  setState({
    loading: false,
    data: USERS,
  });
};

export const select = (uid: string): Action<State> => ({ setState }) => {
  setState({
    selected: uid,
  });
};
