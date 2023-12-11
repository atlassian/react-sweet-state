/* eslint-disable import/no-unresolved */
import { unstable_batchedUpdates } from 'react-dom';
import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_ImmediatePriority as ImmediatePriority,
} from 'scheduler';

import defaults from '../defaults';
import supports from './supported-features';

let batchedScheduled = false;

let batched = [];

const executeBatched = () => {
  unstable_batchedUpdates(() => {
    while (batched.length) {
      const currentBatched = batched;
      batched = [];
      currentBatched.forEach((fn) => fn());
    }
    // important to reset it before exiting this function
    // as React will dump everything right after
    batchedScheduled = false;
  });
};

export function batch(fn) {
  // if we are in node/tests or nested schedule
  if (!defaults.batchUpdates || !supports.scheduling()) {
    return unstable_batchedUpdates(fn);
  }

  batched.push(fn);

  if (!batchedScheduled) {
    batchedScheduled = true;
    return scheduleCallback(ImmediatePriority, executeBatched);
  }
}
