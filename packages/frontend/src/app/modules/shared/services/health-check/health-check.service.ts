import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment";
import { HealthCheckInfo } from "./HealthCheckInfo.type";

@Injectable({
  providedIn: "root",
})
export class HealthCheckService {
  constructor(private readonly http: HttpClient) {}

  public getVersion(): Observable<HealthCheckInfo> {
    return this.http.get<HealthCheckInfo>(`${environment.apiUrl}healthz`);
  }
}
