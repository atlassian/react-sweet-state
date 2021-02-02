/* eslint-disable import/no-unresolved */
import { unstable_batchedUpdates } from 'react-dom';
import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_UserBlockingPriority as UserBlockingPriority,
} from 'scheduler';

import defaults from '../defaults';
import supports from './supported-features';

let isInsideBatchedSchedule = false;

export function batch(fn) {
  // if we are in node/tests or feature disabled or nested schedule
  if (
    !defaults.batchUpdates ||
    !supports.scheduling() ||
    isInsideBatchedSchedule
  ) {
    return unstable_batchedUpdates(fn);
  }

  isInsideBatchedSchedule = true;
  // Use UserBlockingPriority as it has max 250ms timeout
  // https://github.com/facebook/react/blob/master/packages/scheduler/src/forks/SchedulerNoDOM.js#L47
  return scheduleCallback(
    UserBlockingPriority,
    function scheduleBatchedUpdates() {
      unstable_batchedUpdates(fn);
      isInsideBatchedSchedule = false;
    }
  );
}
