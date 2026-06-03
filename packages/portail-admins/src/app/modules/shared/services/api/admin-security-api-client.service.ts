import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SessionsStats } from "@domifa/common";

import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class AdminSecurityApiClient {
  private readonly baseUrl = environment.apiUrl + "admin/security";

  constructor(private readonly http: HttpClient) {}

  public getSessionsStats(structureId?: number): Observable<SessionsStats> {
    let params = new HttpParams();
    if (structureId !== undefined && structureId !== null) {
      params = params.set("structureId", structureId);
    }
    return this.http.get<SessionsStats>(`${this.baseUrl}/sessions/stats`, {
      params,
    });
  }
}
