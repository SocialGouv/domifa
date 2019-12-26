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
  public epInteractions = environment.apiUrl + "interactions/";

  constructor(http: HttpClient) {
    this.http = http;
    this.loading = true;
  }

  public getStatuts() {
    return this.http.get(`${this.epUsagers}stats-domifa`);
  }

  public getInteractionsStats() {
    return this.http.get(`${this.epInteractions}stats-domifa`);
  }
}
