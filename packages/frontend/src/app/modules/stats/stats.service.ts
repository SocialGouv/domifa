import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Stats } from "./stats.interface";
import { map } from "rxjs/operators";

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

  public getToday(): Observable<any> {
    return this.http.get(`${this.baseUrl}today`);
  }

  public findAll(): Observable<Stats[]> {
    return this.http.get(`${this.baseUrl}all`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new Stats(item))
          : [new Stats(response)];
      })
    );
  }

  public getAllStatuts(): Observable<any> {
    return this.http.get(`${this.epUsagers}stats-domifa/all`);
  }

  public getAllUsers(): Observable<any> {
    return this.http.get(`${this.epUsers}stats-domifa/all`);
  }

  public getStructuresStats(): Observable<any> {
    return this.http.get(`${this.epUsagers}stats-domifa/structures`);
  }

  public getAllInteractions(): Observable<any> {
    return this.http.get(`${this.epInteractions}stats-domifa/all`);
  }

  public getStructuresInteractions(): Observable<any> {
    return this.http.get(`${this.epInteractions}stats-domifa/structures`);
  }
}
