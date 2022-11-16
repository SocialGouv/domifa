import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { Observable } from "rxjs";

import type { UsagersImportMode } from "../../../_common/model";
import { environment } from "../../../environments/environment";
import type { ImportPreviewTable } from "./types";

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
