import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MetabaseParams } from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { StructureListForStats } from "../components/national-stats/StructureListForStats.type";

const BASE_URL = environment.apiUrl + "admin/structures";

@Injectable({
  providedIn: "root",
})
export class StatsService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(private readonly http: HttpClient) {}

  public export(
    structureId: number,
    start: Date,
    end: Date | null
  ): Observable<Blob> {
    return this.http.post<Blob>(
      `${this.baseUrl}export/`,
      {
        structureId: parseInt(structureId as unknown as string, 10),
        start,
        end,
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

  public getMetabaseUrl(params: MetabaseParams): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${BASE_URL}/metabase-stats`,
      params
    );
  }
}
