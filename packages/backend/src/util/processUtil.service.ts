import { Logger } from "@nestjs/common";
import { from, Observable, of, throwError } from "rxjs";
import { concatMap, map, reduce } from "rxjs/operators";

export const processUtil = {
  processOneByOneObservable,
  processOneByOnePromise,
};

function processOneByOneObservable<T, R = T>(
  items: T[],
  process: (item: T) => Observable<R>
): Observable<R[]> {
  if (items.length === 0) {
    return of([]) as Observable<R[]>;
  }

  return from(items).pipe(
    // process one by one (wait until previous finish)
    concatMap((value) => process(value)),
    reduce((array, current) => array.concat([current]), [] as R[])
  );
}

async function processOneByOnePromise<T, R = T>(
  items: T[],
  process: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return new Promise((resolve) => {
      resolve([] as R[]);
    });
  }

  const results: R[] = [];
  for (const item of items) {
    const res = await process(item);
    results.push(res);
  }

  return results;
}
