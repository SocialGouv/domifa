import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import {
  StructureStatsFull,
  StructureStatsReportingQuestions,
} from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class StructureStatsService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(private readonly http: HttpClient) {}

  public getReportingQuestions(): Observable<
    StructureStatsReportingQuestions[]
  > {
    return this.http.get<StructureStatsReportingQuestions[]>(
      `${this.baseUrl}reporting-questions`
    );
  }

  public setReportingQuestions(
    reportingQuestionsForm: Partial<StructureStatsReportingQuestions>
  ): Observable<StructureStatsReportingQuestions[]> {
    return this.http.patch<StructureStatsReportingQuestions[]>(
      `${this.baseUrl}reporting-questions`,
      reportingQuestionsForm
    );
  }

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
