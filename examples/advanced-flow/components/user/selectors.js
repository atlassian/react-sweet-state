// @flow

import type { State } from './types';

export const getSelected = (state: State): { sel: string | null } => ({
  sel: state.selected,
});
