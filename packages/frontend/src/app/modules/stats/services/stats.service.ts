import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { PublicStats } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class StatsService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(private readonly http: HttpClient) {}

  public getPublicStats(region?: string): Observable<PublicStats> {
    let statsUrl = this.baseUrl + "public-stats";
    if (region) {
      statsUrl = statsUrl + "/" + region;
    }
    return this.http.get<PublicStats>(statsUrl);
  }
}
