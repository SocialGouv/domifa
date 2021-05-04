import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  NEVER,
  Observable,
  of,
  ReplaySubject,
  timer,
} from "rxjs";
import {
  catchError,
  concatMap,
  debounceTime,
  delay,
  distinctUntilChanged,
  switchMap,
  tap,
} from "rxjs/operators";
import { environment } from "src/environments/environment";
import { HealthCheckInfo } from "./HealthCheckInfo.type";

@Injectable({
  providedIn: "root",
})
export class HealthCheckService {
  private currentStatusCheck$ = new ReplaySubject<HealthCheckInfo>(1);
  private checkEnabled$ = new BehaviorSubject<boolean>(false);
  private checkPeriod$ = new BehaviorSubject<number>(
    environment.healthzCheck.checkPeriodIfSuccess
  );
  private check$ = this.checkEnabled$.pipe(
    distinctUntilChanged(),
    switchMap((enabled) =>
      !enabled
        ? NEVER
        : of(undefined).pipe(
            delay(environment.healthzCheck.initialCheckDelay * 1000),
            switchMap(() => this.checkPeriod$.pipe(distinctUntilChanged())),
            switchMap((checkPeriod: number) => timer(0, checkPeriod * 1000)),
            debounceTime(500), // be sure only one event is triggered
            concatMap(() => this.executeCheck())
          )
    )
  );

  constructor(public http: HttpClient) {
    this.http = http;
    this.check$.subscribe((result) => {
      this.currentStatusCheck$.next(result);
    });
  }

  public enablePeriodicHealthCheck(enabled = true) {
    this.checkEnabled$.next(enabled);
    return this.currentStatusCheck$.pipe(
      distinctUntilChanged(
        (a: HealthCheckInfo, b: HealthCheckInfo) =>
          a?.status === b?.status &&
          a?.details?.version?.info === b?.details?.version?.info
      )
    );
  }

  private executeCheck(): Observable<HealthCheckInfo> {
    return this.http.get<HealthCheckInfo>(`${environment.apiUrl}healthz`).pipe(
      tap(() => {
        this.checkPeriod$.next(environment.healthzCheck.checkPeriodIfSuccess);
      }),
      catchError(() => {
        this.checkPeriod$.next(environment.healthzCheck.checkPeriodIfError);
        const errorStatus: HealthCheckInfo = {
          status: "error",
        };
        return of(errorStatus);
      })
    );
  }
}
