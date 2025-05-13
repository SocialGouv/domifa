import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MetabaseParams } from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { StructureListForStats } from "../types/StructureListForStats.type";

const BASE_URL = `${environment.apiUrl}admin/national-stats`;

@Injectable({
  providedIn: "root",
})
export class StatsService {
  public baseUrl = `${environment.apiUrl}stats/`;

  constructor(private readonly http: HttpClient) {}

  public exportStatsForStructure(
    structureId: number,
    startDate: Date,
    endDate: Date | null
  ): Observable<Blob> {
    return this.http.post<Blob>(
      `${BASE_URL}/export-structure-stats/`,
      {
        structureId: parseInt(structureId as unknown as string, 10),
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
      `${BASE_URL}/metabase-get-structures`,
      params
    );
  }

  public getLastUpdateOfStats(): Observable<Date> {
    return this.http.get<Date>(`${BASE_URL}/last-update`);
  }

  public getMetabaseUrl(params: MetabaseParams): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${BASE_URL}/metabase-stats`,
      params
    );
  }
}
