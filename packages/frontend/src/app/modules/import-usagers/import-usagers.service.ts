import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { UsagersImportMode } from "../../../_common/model";
import { ImportPreviewTable } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class ImportUsagersService {
  constructor(private readonly http: HttpClient) {}

  public import(
    mode: UsagersImportMode,
    data: FormData
  ): Observable<{
    importMode: UsagersImportMode;
    previewTable: ImportPreviewTable;
  }> {
    return this.http.post<{
      importMode: UsagersImportMode;
      previewTable: ImportPreviewTable;
    }>(environment.apiUrl + "import/" + mode, data);
  }
}
