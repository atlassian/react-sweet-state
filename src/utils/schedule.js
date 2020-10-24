import defaults from '../defaults';
import { unstable_batchedUpdates as batch } from './batched-updates';

const QUEUE = [];
let scheduled;

export default function schedule(fn) {
  // if we are in node/tests or explicitly told not to,
  // disable async batching
  if (!defaults.batchUpdates) return batch(() => fn());

  // Add to queue if not already there
  // so we avoid multiple notifications to same store
  if (!QUEUE.includes(fn)) QUEUE.push(fn);

  // if something already started schedule, skip
  if (scheduled) return;

  // use promise then to wait next tick before notifying
  scheduled = Promise.resolve().then(function runNotifyQueue() {
    batch(() => {
      for (let i = 0; i < QUEUE.length; i++) {
        QUEUE[i]();
      }
    });
    QUEUE.length = 0;
    scheduled = null;
  });
}
