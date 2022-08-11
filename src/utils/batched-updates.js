/* eslint-disable import/no-unresolved */
import { unstable_batchedUpdates } from 'react-dom';
import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_ImmediatePriority as ImmediatePriority,
} from 'scheduler';

import defaults from '../defaults';
import supports from './supported-features';

let isInsideBatchedSchedule = false;

export function batch(fn) {
  // if we are in node/tests or nested schedule
  if (
    !defaults.batchUpdates ||
    !supports.scheduling() ||
    isInsideBatchedSchedule
  ) {
    return unstable_batchedUpdates(fn);
  }

  isInsideBatchedSchedule = true;
  // Use ImmediatePriority as it has -1ms timeout
  // https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L65
  return scheduleCallback(ImmediatePriority, function scheduleBatchedUpdates() {
    unstable_batchedUpdates(fn);
    isInsideBatchedSchedule = false;
  });
}
