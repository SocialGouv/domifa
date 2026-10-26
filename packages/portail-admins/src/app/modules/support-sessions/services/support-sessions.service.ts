import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SupportSessionHistoryItem } from "@domifa/common";

import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class SupportSessionsService {
  private readonly endPoint = environment.apiUrl + "admin/support-sessions";

  constructor(private readonly http: HttpClient) {}

  // Dates as "yyyy-mm-dd", straight from the date inputs.
  public list(filters: {
    startDateFrom?: string;
    startDateTo?: string;
  }): Observable<SupportSessionHistoryItem[]> {
    let params = new HttpParams();
    if (filters.startDateFrom) {
      params = params.set("startDateFrom", filters.startDateFrom);
    }
    if (filters.startDateTo) {
      params = params.set("startDateTo", filters.startDateTo);
    }
    return this.http.get<SupportSessionHistoryItem[]>(this.endPoint, {
      params,
    });
  }
}
