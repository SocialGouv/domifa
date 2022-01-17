import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment";
import { SmdId, StatsPeriod, GlobalType } from "src/_common/stats";

const BASE_URL = `${environment.apiUrl}admin/sms`;

@Injectable()
export class AdminSmsApiClient {
  constructor(private http: HttpClient) {}

  public getStatsGlobal(type: GlobalType): Observable<any> {
    return this.http.get(`${BASE_URL}/stats/global/${type}`);
  }

  public getStats(smsId: SmdId, period: StatsPeriod): Observable<any> {
    return this.http.get(`${BASE_URL}/stats/${smsId}/${period}`);
  }
}
