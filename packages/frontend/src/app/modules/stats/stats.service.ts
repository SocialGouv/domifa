import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Structure } from "../structures/structure.interface";
import { Stats } from "./stats.interface";

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

  public getToday(): Observable<Stats> {
    return this.http.get(`${this.baseUrl}today`).pipe(
      map((response: any) => {
        return new Stats(response);
      })
    );
  }

  public getStatById(id: string): Observable<Stats> {
    return this.http.get(`${this.baseUrl}id/${id}`).pipe(
      map((response: any) => {
        return new Stats(response);
      })
    );
  }

  // DASHBOARD
  public getStats(
    start: Date,
    end?: Date
  ): Observable<{
    stats: Stats;
    startDate?: Date;
    endDate?: Date;
  }> {
    return this.http
      .post<{
        stats: Stats;
        startDate?: Date;
        endDate?: Date;
      }>(this.baseUrl, {
        start,
        end,
      })
      .pipe(
        map((response) => {
          return {
            ...response,
            stats: new Stats(response.stats),
          };
        })
      );
  }

  public getAvailabelStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}available`);
  }

  // DASHBOARD
  public getStructures(): Observable<Structure[]> {
    return this.http.get(environment.apiUrl + `dashboard/structures`, {}).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new Structure(item))
          : [new Structure(response)];
      })
    );
  }

  public getStructuresByType(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/structures/type`);
  }

  public getInteractions(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/interactions`);
  }

  public getUsers(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/users`);
  }

  public getDocs(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/docs`);
  }

  public getUsagersValide(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/usagers/valide`);
  }

  public getStructuresByRegion(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/structures/regions`);
  }

  public getUsagers(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/usagers`);
  }

  public export(start, end) {
    return this.http.post(
      `${this.baseUrl}export/`,
      {
        start,
        end,
      },
      { responseType: "blob" as "json" }
    );
  }

  public exportId(statId: string) {
    return this.http.get(`${this.baseUrl}export/` + statId, {
      responseType: "blob",
    });
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
