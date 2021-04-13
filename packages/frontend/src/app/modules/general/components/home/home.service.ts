import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(public http: HttpClient) {}

  public getHomeStats(): Observable<any> {
    return this.http.get(this.baseUrl + `home-stats`);
  }
}
