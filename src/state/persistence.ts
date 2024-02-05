// import AsyncStorage from '@react-native-async-storage/async-storage';
import { IState, MiddlewareFn } from './createState';

interface IStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

type SerializeFn = (value: any) => string;
type DeserializeFn = (text: string) => any;
type Callback = (res: any) => void;

interface PersistenceOptions {
  storage?: string | IStorage;
  deserializeFn?: DeserializeFn;
  serializeFn?: SerializeFn;
  blacklist?: { [x: string]: boolean };
  whitelist?: { [x: string]: boolean };
}

export const persistence = (
  key: string,
  options: PersistenceOptions = {},
): MiddlewareFn<any> => {
  if (typeof key !== 'string') {
    throw new Error('Persistence requires a string key.');
  }

  let storageType = options.storage || 'local';
  let storage: IStorage | undefined;
  if (storageType === 'local') {
    storage = getLocalStorage();
  }
  // else {
  //   validateCustomStorage(storage);
  // }

  if (storage === undefined) {
    console.warn('Storage unavailable. Persistence disabled.');
    return (_, action, next) => next(action);
  }

  return (state, action, next) => {
    if (action.type === 'init') {
      const deserialize = options.deserializeFn || JSON.parse;

      // Fetch persisted value (if any) from storage
      getItem(storage as IStorage, key, deserialize, res => {
        action.value = res;
        next(action);
      });
    } else if (action.type === 'set') {
      const fn = (value: any) => {
        let newValue = options.whitelist
          ? applyWhitelist(options, value)
          : value;
        newValue = options.blacklist
          ? applyBlacklist(options, newValue)
          : newValue;
        return JSON.stringify(newValue);
      };
      const serialize = options.serializeFn || fn;

      // Persist the new value to storage
      setItem(
        storage as IStorage,
        key,
        Array.isArray(state)
          ? [...state, ...action.value]
          : typeof state === 'object'
          ? { ...state, ...action.value }
          : action.value,
        serialize,
      );
    }
    next(action);
  };
};

const applyBlacklist = (options: PersistenceOptions, value: any) => {
  const maps: any[] = Object.entries(value)
    .map(entry => {
      const key = entry[0];
      if (options?.blacklist?.[key] !== true) {
        return [key, entry[1]];
      }
      return undefined;
    })
    .filter(item => item);
  return Object.fromEntries(maps);
};

const applyWhitelist = (options: PersistenceOptions, value: any) => {
  const maps: any[] = Object.entries(value)
    .map(entry => {
      const key = entry[0];
      if (options?.whitelist?.[key] === true) {
        return [key, entry[1]];
      }
      return undefined;
    })
    .filter(item => item);
  return Object.fromEntries(maps);
};

const getLocalStorage = (): IStorage => {
  return {
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) => localStorage.setItem(key, value),
  };
};

// const validateCustomStorage = (storage: IStorage) => {
//   if (
//     typeof storage.getItem !== 'function' ||
//     typeof storage.setItem !== 'function'
//   ) {
//     throw new Error('Persistence: Invalid storage.');
//   }
// };

const getItem = (
  storage: IStorage,
  key: string,
  deserialize: DeserializeFn,
  callback: Callback,
) => {
  const res = storage.getItem(key);
  if (res == null) {
    return;
  }

  if (res instanceof Promise) {
    res.then(val => {
      if (val != null) {
        processValue(deserialize, val, callback);
      }
    });
  } else {
    processValue(deserialize, res, callback);
  }
};

const setItem = (
  storage: IStorage,
  key: string,
  value: string,
  serialize: SerializeFn,
) => {
  processValue(serialize, value, res => storage.setItem(key, res));
};

const processValue = (
  func: SerializeFn | DeserializeFn,
  value: any,
  callback: Callback,
) => {
  const res = func(value);
  if (res && typeof res.then === 'function') {
    res.then(callback);
  } else {
    callback(res);
  }
};

export default persistence;
