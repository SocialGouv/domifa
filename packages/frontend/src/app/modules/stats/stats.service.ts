import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Stats } from "./stats.interface";
import { map } from "rxjs/operators";
import { Structure } from "../structures/structure.interface";

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

  // DASHBOARD
  public getStructures(): Observable<Structure[]> {
    return this.http.get(environment.apiUrl + `dashboard/structures`).pipe(
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

  public getUsagersValide(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/usagers/valide`);
  }

  public getStructuresByRegion(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/structures/regions`);
  }

  public getUsagers(): Observable<any> {
    return this.http.get(environment.apiUrl + `dashboard/usagers`);
  }
}
