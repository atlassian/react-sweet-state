/* eslint-disable import/no-unresolved */
import { unstable_batchedUpdates } from 'react-dom';
import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_ImmediatePriority as ImmediatePriority,
} from 'scheduler';

import defaults from '../defaults';
import supports from './supported-features';

let isInsideBatchedSchedule = 0;

export function batch(fn) {
  // if we are in node/tests or nested schedule
  if (
    !defaults.batchUpdates ||
    !supports.scheduling() ||
    isInsideBatchedSchedule
  ) {
    return unstable_batchedUpdates(fn);
  }

  isInsideBatchedSchedule = 0;
  // Use ImmediatePriority as it has -1ms timeout
  // https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L65
  return scheduleCallback(ImmediatePriority, function scheduleBatchedUpdates() {
    isInsideBatchedSchedule++;
    unstable_batchedUpdates(fn);
    isInsideBatchedSchedule--;
  });
}
