import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  public http: HttpClient;
  public baseUrl = environment.apiUrl + "stats/";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public getHomeStats(): Observable<any> {
    return this.http.get(this.baseUrl + `home-stats`);
  }
}
