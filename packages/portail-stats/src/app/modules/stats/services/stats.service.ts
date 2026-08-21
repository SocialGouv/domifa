import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MetabaseParams, StructureListForStats } from "@domifa/common";
import { Observable } from "rxjs";
import { STATS_API_BASE } from "../stats.constants";

@Injectable({
  providedIn: "root",
})
export class StatsService {
  constructor(private readonly http: HttpClient) {}

  public exportStatsForStructure(
    structureId: number,
    startDate: Date,
    endDate: Date | null
  ): Observable<Blob> {
    return this.http.post<Blob>(
      `${STATS_API_BASE}/export-structure-stats/`,
      {
        structureId: Number.parseInt(structureId as unknown as string, 10),
        startDate,
        endDate,
      },
      { responseType: "blob" as "json" }
    );
  }

  public getStructures(
    params: MetabaseParams
  ): Observable<Array<StructureListForStats>> {
    return this.http.post<Array<StructureListForStats>>(
      `${STATS_API_BASE}/metabase-get-structures`,
      params
    );
  }

  public getLastUpdateOfStats(): Observable<Date> {
    return this.http.get<Date>(`${STATS_API_BASE}/last-update`);
  }

  public getMetabaseUrl(params: MetabaseParams): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${STATS_API_BASE}/metabase-stats`,
      params
    );
  }
}
