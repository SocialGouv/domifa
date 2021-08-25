import { PublicStats } from "./../../../../_common/model/stats/PublicStats.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { StructureStatsFull } from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class StatsService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(public http: HttpClient) {}

  public getStats(
    structureId: number,
    start: Date,
    end?: Date
  ): Observable<StructureStatsFull> {
    return this.http.post<any>(this.baseUrl, {
      structureId,
      start,
      end,
    });
  }

  public getPublicStats(region?: string): Observable<PublicStats> {
    let statsUrl = this.baseUrl + "public-stats";
    if (region) {
      statsUrl = statsUrl + "/" + region;
    }
    return this.http.get<PublicStats>(statsUrl);
  }

  public export(structureId: number, start: Date, end: Date) {
    return this.http.post(
      `${this.baseUrl}export/`,
      {
        structureId,
        start,
        end,
      },
      { responseType: "blob" as "json" }
    );
  }
}
