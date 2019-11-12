import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { LoadingService } from "../loading/loading.service";
import { Usager } from "../usagers/interfaces/usager";

@Injectable({
  providedIn: "root"
})
export class StatsService {
  public http: HttpClient;
  public loading: boolean;
  public endPointUsagers = environment.apiUrl + "stats";

  constructor(http: HttpClient) {
    this.http = http;
    this.loading = true;
  }

  public getAll() {
    return this.http.get(`${this.endPointUsagers}`);
  }
}
