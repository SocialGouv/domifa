import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { PageResults } from "@domifa/common";

import { environment } from "../../../../environments/environment";
import {
  SecurityUserSummary,
  SuspiciousActivityFilters,
  SuspiciousActivityLog,
  SuspiciousUserProfile,
  UserSessionsView,
} from "../types/suspicious-activity-log";

@Injectable({ providedIn: "root" })
export class SuspiciousActivityService {
  private readonly endPoint = environment.apiUrl + "admin/security";

  constructor(private readonly http: HttpClient) {}

  public list(
    filters: SuspiciousActivityFilters,
    page: number,
    take: number
  ): Observable<PageResults<SuspiciousActivityLog>> {
    let params = new HttpParams().set("page", page).set("take", take);

    if (filters.actions?.length) {
      for (const action of filters.actions) {
        params = params.append("actions", action);
      }
    }
    if (filters.dateFrom) {
      params = params.set("dateFrom", filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set("dateTo", filters.dateTo);
    }
    if (filters.ip) {
      params = params.set("ip", filters.ip);
    }
    if (filters.identifier) {
      params = params.set("identifier", filters.identifier);
    }
    if (filters.userId) {
      params = params.set("userId", filters.userId);
    }
    if (filters.userType) {
      params = params.set("userType", filters.userType);
    }

    return this.http.get<PageResults<SuspiciousActivityLog>>(
      `${this.endPoint}/suspicious-activity`,
      { params }
    );
  }

  public getUserSummary(
    userType: SuspiciousUserProfile,
    userUuid: string
  ): Observable<SecurityUserSummary> {
    return this.http.get<SecurityUserSummary>(
      `${this.endPoint}/users/${userType}/${userUuid}`
    );
  }

  public getUserSessions(
    userType: SuspiciousUserProfile,
    userUuid: string
  ): Observable<UserSessionsView> {
    return this.http.get<UserSessionsView>(
      `${this.endPoint}/users/${userType}/${userUuid}/sessions`
    );
  }
}
