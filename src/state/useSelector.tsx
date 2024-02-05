import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

export const strictEqual = (a: any, b: any) => a === b;

const identity = (v: any) => v;

export const useStateSelector = (
  entity: any,
  transform = identity,
  equality = strictEqual,
) => {
  if (!(entity._subscribers instanceof Set)) throw new Error('Invalid entity.');

  return useSyncExternalStoreWithSelector(
    entity._subscribe,
    entity.get,
    entity.get,
    transform,
    equality,
  );
};

export default useStateSelector;
