import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { delay, Observable, tap } from "rxjs";
import { environment } from "../../../../../environments/environment";
import * as fileSaver from "file-saver";

const BASE_URL = environment.apiUrl + "stats";

@Injectable()
export class AdminStructuresExportApiClient {
  constructor(public http: HttpClient) {}

  public exportYearStats({
    structureId,
    year,
  }: {
    structureId: number;
    year: number;
  }): Observable<any> {
    const period = {
      start: new Date(year.toString() + "-01-01"),
      end: new Date(year.toString() + "-12-31"),
    };

    return this.http
      .post(
        `${BASE_URL}/export/`,
        {
          structureId,
          start: period.start,
          end: period.end,
        },
        { responseType: "blob" as "json" }
      )
      .pipe(
        tap((x: any) => {
          const newBlob = new Blob([x], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const fileName = buildExportStructureStatsFileName({
            startDateUTC: period.start,
            endDateUTC: period.end,
            structureId,
          });
          fileSaver.saveAs(newBlob, fileName);
        }),
        delay(500)
      );
  }
}
function buildExportStructureStatsFileName({
  startDateUTC,
  endDateUTC,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTC: Date;
  structureId: number;
}): string {
  return `${format(startDateUTC, "yyyy-MM-dd")}_${format(
    endDateUTC,
    "yyyy-MM-dd"
  )}_export-structure-${structureId}-stats.xlsx`;
}
