import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { DashboardStats } from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class AdminDomifaService {
  public epDashboard = environment.apiUrl + "dashboard/";
  public epSms = environment.apiUrl + "sms/";
  public baseUrl = environment.apiUrl + "stats/";

  constructor(public http: HttpClient) {}

  public getStatsDomifaAdminDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.epDashboard);
  }

  public exportDashboard() {
    return this.http.get(`${this.epDashboard}export`, {
      responseType: "blob",
    });
  }

  public deleteStructure(structureId: string) {
    return this.http.delete(environment.apiUrl + `structures/` + structureId);
  }

  public enableSms(structureId: number) {
    return this.http.get(this.epSms + "enable/" + structureId.toString());
  }

  public export(structureId: number, start: Date, end: Date) {
    return this.http.post(
      `${this.baseUrl}export/`,
      {
        structureId,
        start,
        end,
      },
      { responseType: "blob" as "json" }
    );
  }
}
