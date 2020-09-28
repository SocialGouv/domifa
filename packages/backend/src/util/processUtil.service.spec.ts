import { of } from "rxjs";
import { delay, map, tap } from "rxjs/operators";
import { processUtil } from "./processUtil.service";

describe("ProcessUtil Controller", () => {
  it("processOneByOneObservable ", async () => {
    const r0 = 8;
    const commonVar = {
      value: r0,
    };

    const results = await processUtil
      .processOneByOneObservable([2, 5, 10], (x) =>
        of(x).pipe(
          map((xAdd) => commonVar.value + xAdd),
          delay(50),
          map((xAddRes) => xAddRes * x),
          tap((result) => {
            commonVar.value = result;
          })
        )
      )
      .toPromise();

    expect(results.length).toEqual(3);
    const r1 = (r0 + 2) * 2;
    expect(results[0]).toEqual(r1);
    const r2 = (r1 + 5) * 5;
    expect(results[1]).toEqual(r2);
    const r3 = (r2 + 10) * 10;
    expect(results[2]).toEqual(r3);
    expect(commonVar.value).toEqual(r3);
  });
  it("processOneByOnePromise ", async () => {
    const r0 = 8;
    const commonVar = {
      value: r0,
    };

    const results = await processUtil.processOneByOnePromise([2, 5, 10], (x) =>
      of(x)
        .pipe(
          map((xAdd) => commonVar.value + xAdd),
          delay(50),
          map((xAddRes) => xAddRes * x),
          tap((result) => {
            commonVar.value = result;
          })
        )
        .toPromise()
    );

    expect(results.length).toEqual(3);
    const r1 = (r0 + 2) * 2;
    expect(results[0]).toEqual(r1);
    const r2 = (r1 + 5) * 5;
    expect(results[1]).toEqual(r2);
    const r3 = (r2 + 10) * 10;
    expect(results[2]).toEqual(r3);
    expect(commonVar.value).toEqual(r3);
  });
});
