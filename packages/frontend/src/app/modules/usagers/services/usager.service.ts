import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersCache } from "../../../shared/store";
import { SearchPageLoadedUsagersData } from "../../../shared/store/AppStoreModel.type";
import { ImportPreviewTable } from "../components/import/preview";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        tap((x) =>
          // update cache
          usagersCache.updateUsager(x)
        ),
        startWith(usagersCache.getSnapshot().usagersByRefMap[usagerRef]), // try to load value from cache
        filter((x) => !!x) // filter out empty cache value
      );
  }

  /* Recherche */
  public getSearchPageUsagerData({
    chargerTousRadies,
  }: {
    chargerTousRadies: boolean;
  }): Observable<SearchPageLoadedUsagersData> {
    return this.http
      .get<SearchPageLoadedUsagersData>(
        `${environment.apiUrl}usagers/?chargerTousRadies=${chargerTousRadies}`
      )
      .pipe(
        tap((searchPageLoadedUsagersData: SearchPageLoadedUsagersData) => {
          usagersCache.setSearchPageLoadedUsagersData(
            searchPageLoadedUsagersData
          );
        }),
        startWith(usagersCache.getSnapshot().searchPageLoadedUsagersData),
        filter((x) => !!x)
      );
  }

  public getSearchPageRemoteSearchRadies({
    searchString,
  }: {
    searchString: string;
  }): Observable<UsagerLight[]> {
    return this.http
      .post<UsagerLight[]>(`${environment.apiUrl}usagers/search-radies`, {
        searchString,
      })
      .pipe(
        tap((usagers: UsagerLight[]) => {
          usagersCache.updateUsagers(usagers);
        })
      );
  }

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
