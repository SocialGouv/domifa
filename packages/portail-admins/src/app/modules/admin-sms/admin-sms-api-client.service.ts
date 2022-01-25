import { StatsSmsApiDatas } from "./../../../_common/stats/StatsSmsApiDatas.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment";
import { StatsPeriod, MessageSmsId } from "src/_common/stats";

const BASE_URL = `${environment.apiUrl}admin/sms`;

@Injectable()
export class AdminSmsApiClient {
  constructor(private http: HttpClient) {}

  public getStatsGlobal(): Observable<StatsSmsApiDatas> {
    return this.http.get<StatsSmsApiDatas>(`${BASE_URL}/stats/global`);
  }

  public getStats(
    smsId: MessageSmsId,
    period: StatsPeriod
  ): Observable<StatsSmsApiDatas> {
    return this.http.get<StatsSmsApiDatas>(
      `${BASE_URL}/stats/${smsId}/${period}`
    );
  }
}
