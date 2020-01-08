import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class StatsService {
  public http: HttpClient;
  public loading: boolean;
  public epUsagers = environment.apiUrl + "usagers/";
  public epUsers = environment.apiUrl + "users/";
  public epInteractions = environment.apiUrl + "interactions/";

  constructor(http: HttpClient) {
    this.http = http;
    this.loading = true;
  }

  public getAllStatuts() {
    return this.http.get(`${this.epUsagers}stats-domifa/all`);
  }

  public getAllUsers() {
    return this.http.get(`${this.epUsers}stats-domifa/all`);
  }

  public getStructuresStats() {
    return this.http.get(`${this.epUsagers}stats-domifa/structures`);
  }

  public getAllInteractions() {
    return this.http.get(`${this.epInteractions}stats-domifa/all`);
  }

  public getStructuresInteractions() {
    return this.http.get(`${this.epInteractions}stats-domifa/structures`);
  }
}
