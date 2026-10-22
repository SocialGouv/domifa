import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SupportSessionHistoryItem } from "@domifa/common";

import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class SupportSessionsService {
  private readonly endPoint = environment.apiUrl + "admin/support-sessions";

  constructor(private readonly http: HttpClient) {}

  public list(filters: {
    startDateFrom?: Date;
    startDateTo?: Date;
  }): Observable<SupportSessionHistoryItem[]> {
    let params = new HttpParams();
    if (filters.startDateFrom) {
      params = params.set("startDateFrom", filters.startDateFrom.toISOString());
    }
    if (filters.startDateTo) {
      params = params.set("startDateTo", filters.startDateTo.toISOString());
    }
    return this.http.get<SupportSessionHistoryItem[]>(this.endPoint, {
      params,
    });
  }
}
