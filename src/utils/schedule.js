import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_UserBlockingPriority as UserBlockingPriority,
} from 'scheduler';
import defaults from '../defaults';
import { unstable_batchedUpdates as batch } from './batched-updates';
import supports from './supported-features';

const QUEUE = [];
let scheduled;

export default function schedule(fn) {
  // if we are in node/tests or feature disabled, make updates sync batched
  if (!defaults.batchUpdates || !supports.scheduling())
    return batch(() => fn());

  // Add to queue if not already there
  // so we avoid multiple notifications to same store listeners
  if (!QUEUE.includes(fn)) QUEUE.push(fn);

  // if something already started schedule, skip
  if (scheduled) return;

  // Use UserBlockingPriority as it has max 250ms timeout
  // https://github.com/facebook/react/blob/master/packages/scheduler/src/forks/SchedulerNoDOM.js#L47
  scheduled = scheduleCallback(UserBlockingPriority, function runNotifyQueue() {
    batch(() => {
      let queueFn;
      while ((queueFn = QUEUE.shift())) queueFn();
      scheduled = null;
    });
  });
}
