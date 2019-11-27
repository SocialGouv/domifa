import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class StatsService {
  public http: HttpClient;
  public loading: boolean;
  public endPointUsagers = environment.apiUrl + "usagers/";

  constructor(http: HttpClient) {
    this.http = http;
    this.loading = true;
  }

  public getStatuts() {
    return this.http.get(`${this.endPointUsagers}stats`);
  }
}
