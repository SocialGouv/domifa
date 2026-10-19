import { HttpClient, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { ImportUsagersResponse, UsagersImportMode } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class ImportUsagersService {
  constructor(private readonly http: HttpClient) {}

  public import(
    mode: UsagersImportMode,
    data: FormData
  ): Observable<HttpEvent<ImportUsagersResponse>> {
    return this.http.post<ImportUsagersResponse>(
      `${environment.apiUrl}import/${mode}`,
      data,
      { observe: "events", reportProgress: true }
    );
  }
}
