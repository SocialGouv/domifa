import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { HomeStats } from "./HomeStats.type";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  public baseUrl: string;

  constructor(public http: HttpClient) {
    this.baseUrl = environment.apiUrl + "stats/";
  }

  public getHomeStats(): Observable<HomeStats> {
    return this.http.get(this.baseUrl + `home-stats`).pipe(
      map((retour) => {
        return retour as HomeStats;
      })
    );
  }
}
