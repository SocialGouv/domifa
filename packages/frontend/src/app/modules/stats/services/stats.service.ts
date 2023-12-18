import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { StructureStatsFull } from "../../../../_common/model";
import { PublicStats } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class StatsService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(private readonly http: HttpClient) {}

  public getStats(
    structureId: number,
    start: Date,
    end: Date | null
  ): Observable<StructureStatsFull> {
    return this.http.post<StructureStatsFull>(this.baseUrl, {
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

  public export(
    structureId: number,
    start: Date,
    end: Date | null
  ): Observable<Blob> {
    return this.http.post<Blob>(
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
