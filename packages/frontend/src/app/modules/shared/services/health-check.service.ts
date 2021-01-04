import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, pipe } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { environment } from "src/environments/environment";

export type HealthCheckType = {
  status: "ok" | "error";
  info?: {
    version?: {
      info?: string;
      status?: string;
    };
  };
};

@Injectable({
  providedIn: "root",
})
export class HealthCheckService {
  public currentStatusCheck$: BehaviorSubject<HealthCheckType>;

  constructor(public http: HttpClient) {
    this.http = http;
  }

  public healthCheck(): Observable<any> {
    return this.http.get(`${environment.apiUrl}healthz`).pipe(
      map((retour: HealthCheckService) => {
        return retour;
      }),
      catchError(() => {
        return of({ status: "error" });
      })
    );
  }
}
