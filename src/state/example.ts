import { MiddlewareFn, createState } from './createState';
import persistence from './persistence';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
function promiseWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Promise timed out'),
): Promise<T> {
  // create a promise that rejects in milliseconds
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError);
    }, ms);
  });

  // returns a race between timeout and the passed promise
  return Promise.race<T>([promise, timeout]);
}

const fet = async () => {
  return wait(3000).then(() => 15);
};

const logMiddleware: MiddlewareFn<number> = (state, action, next) => {
  console.log('State:', state);
  console.log('Action:', action);
  return next(action);
};

export const counter = createState<number>(0 /* OR -> fet() */, [
  // logMiddleware,
  persistence('countere'), // this a plugin
]);

export const reset = () => {
  counter.set(0);
};

export const increment = (by: number) => {
  counter.set((value: number) => value + by);
  // --OR-->  counter.set(counter.get() + by)
};
