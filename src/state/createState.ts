import { useStateSelector } from './useSelector';
import { produce } from 'immer';

export type StateHook<T> = {
  (): T;
  <C>(transform?: (value: T) => C, equalityFn?: (a: any, b: any) => boolean): C;
};

type SetUpdaterFn<T, P extends unknown[]> = (value: T, ...args: P) => T;
type InternalValue = {
  state: any;
};

export interface Plugin {
  /**
   * Returns an override for the entity's `init` method
   * @param origSet - original `init`
   * @param entity - target entity
   */
  init?: (origInit: () => void, entity: State<any>) => () => void;

  /**
   * Returns an override for the entity's `set` method
   * @param origSet - original `set`
   * @param entity - target entity
   */
  set?: (
    origSet: (...args: any[]) => void,
    entity: State<any>,
  ) => (...args: any[]) => void;
}

export type ActionType<T> = { type: string; value: T | T[] | Partial<T> };

export type MiddlewareFn<T> = (
  state: T,
  action: ActionType<T>,
  next: (action: ActionType<T>) => void,
) => void;

export interface IState<T> {
  /** Sets the entity to its initial value */
  init: () => void;

  /** Returns the current value of the entity */
  get: () => T |undefined;

  /** Updates the value of the entity */
  set: {
    (newValue: T): void;
    <P extends unknown[]>(
      updaterFn: SetUpdaterFn<T, P>,
      ...updaterArgs: P
    ): void;
  };

  /** Updates the value of the entity */
  merge: {
    (newValue: Partial<T>): void;
  };

  pushAction: {
    (action: ActionType<any>): void;
  };

  /** Binds the entity value to component state */
  use: StateHook<T>;
}

export function isProxyable(value: any) {
  if (!value) {
    return false;
  }
  if (typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

class State<T = any> implements IState<T> {
  private _value: InternalValue;
  private _subscribers: Set<(v: T) => void>;
  private _subscribe: (fn: any) => () => void;
  private _middlewares: MiddlewareFn<T>[];

  init: () => void;
  get: () => T | undefined;
  set: {
    (newValue: T): void;
    <P extends unknown[]>(
      updaterFn: SetUpdaterFn<T, P>,
      ...updaterArgs: P
    ): void;
  };
  merge: {
    (newValue: Partial<T>): void;
  };
  pushAction: {
    (action: ActionType<any>): void;
  };
  use: StateHook<T>;

  constructor(
    initialValue: T | Promise<T>,
    middlewares: MiddlewareFn<T>[] = [],
  ) {
    this._value = { state: undefined };
    this._subscribers = new Set();
    this._subscribe = this.createSubscribe();
    this.get = () => this._value.state;
    this.set = this.createSetter();
    this.merge = this.createMerge();
    this.init = this.createInit(initialValue);
    this.use = this.createHook();
    this.pushAction = (action: ActionType<any>) => this.dispatchToMiddleware(action);

    this._middlewares = middlewares;
    this._middlewares.push((_, action) => {
      // console.log('New Value:', action.value);

      this._value.state = Array.isArray(this._value.state) && Array.isArray(action.value)
        ? [...this._value.state, ...action.value]
        : typeof this._value.state === 'object'
        ? { ...this._value.state, ...action.value }
        : action.value;

      // console.log('New State:', this._value.state);

      this._subscribers.forEach((cb: typeof this._value.state) => cb(this._value.state));
    });
  }

  private createInit(initialValue: T | Promise<T>) {
    if (initialValue instanceof Promise) {
      return () => {
        // Call the setter so that any bound components are updated
        // The `setTimeout` is for preventing race conditions with subscriptions
        initialValue.then((value: T) =>
          setTimeout(() => {
            const action = { type: 'init', value };
            this.dispatchToMiddleware(action);
          }),
        );
      };
    }
    return () => {
      const action = { type: 'init', value: initialValue };
      this.dispatchToMiddleware(action);
    };
  }

  private createSetter =
    <P extends unknown[]>() =>
    (newValue: SetUpdaterFn<T, P> | T, ...updaterArgs: P) => {
      let v: unknown;
      if (typeof newValue === 'function') {
        const updater: SetUpdaterFn<T, P> = newValue as SetUpdaterFn<T, P>;
        v = updater(this._value.state, ...updaterArgs);
      } else {
        v = newValue as T;
      }

      const action: ActionType<T> = { type: 'set', value: v as T };
      this.dispatchToMiddleware(action);
    };

  // isObject = <P extends unknown[]>(
  //   object: Partial<T> | UpdaterFn<T, P>,
  // ): object is Partial<T> => {
  //   return (object as Partial<T>) !== undefined;
  // };

  private createMerge = () => (newValue: Partial<T>) => {
    // if (!this.isObject<P>(newValue) as ) {
    //   let func = newValue as UpdaterFn<T, P>;
    //   if (isProxyable(this._value.state)) {
    //     newValue = produce(this._value.state, draft =>
    //       func(draft, ...updaterArgs),
    //     );
    //   } else {
    //     newValue = func(this._value.state, ...updaterArgs);
    //   }
    // }

    const action: ActionType<T> = { type: 'set', value: newValue };
    this.dispatchToMiddleware(action);
  };

  private dispatchToMiddleware = (action: ActionType<T>) => {
    const state = this._value.state;
    let currentMiddleware = this._middlewares[0];

    // nextIdx is the index of the next middleware to call (nextMidFn) in the middlewares array
    const nextMid =
      (nextIdx: number, nextMidFn: MiddlewareFn<T>) =>
      (_action: ActionType<T>) => {
        nextMidFn?.(
          state,
          _action,
          nextMid(nextIdx + 1, this._middlewares[nextIdx + 1]),
        );
      };

    currentMiddleware(state, action, nextMid(1, this._middlewares[1]));
  };

  private createSubscribe = () => (subscriberFn: (v: T) => void) => {
    this._subscribers.add(subscriberFn);
    return () => {
      this._subscribers.delete(subscriberFn);
    };
  };

  private createHook = () => {
    return (...args: any[]) => useStateSelector(this, ...args);
  };
}

export const createState = <T>(
  initialValue: T | Promise<T>,
  middlewares: MiddlewareFn<T>[] = [],
) => {
  const state = new State<T>(initialValue, middlewares);
  state.init();

  // // Add this entity to store (if enabled) for use with `resetAll`
  // if (isStoreEnabled()) {
  //   store.add(newEntity);
  // }

  return state;
};
