import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { DashboardStats, StructureStats } from "../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class StatsService {
  public http: HttpClient;
  public loading: boolean;

  public baseUrl = environment.apiUrl + "stats/";
  public epUsagers = environment.apiUrl + "usagers/";
  public epUsers = environment.apiUrl + "users/";
  public epInteractions = environment.apiUrl + "interactions/";
  public epDashboard = environment.apiUrl + "dashboard/";

  constructor(http: HttpClient) {
    this.http = http;
    this.loading = true;
  }

  public getStatById(id: string): Observable<StructureStats> {
    return this.http.get<StructureStats>(`${this.baseUrl}id/${id}`);
  }

  public getStats(
    start: Date,
    end?: Date
  ): Observable<{
    stats: StructureStats;
    startDate?: Date;
    endDate?: Date;
  }> {
    return this.http.post<{
      stats: StructureStats;
      startDate?: Date;
      endDate?: Date;
    }>(this.baseUrl, {
      start,
      end,
    });
  }

  // DASHBOARD
  public getStatsDomifaAdminDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.epDashboard);
  }

  public export(start: Date, end: Date) {
    return this.http.post(
      `${this.baseUrl}export/`,
      {
        start,
        end,
      },
      { responseType: "blob" as "json" }
    );
  }
  public exportDashboard() {
    return this.http.get(`${this.epDashboard}export`, {
      responseType: "blob",
    });
  }

  public deleteStructure(structureId: string) {
    return this.http.delete(environment.apiUrl + `structures/` + structureId);
  }
}
