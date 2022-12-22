import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersCache } from "../../../shared/store";
import { SearchPageLoadedUsagersData } from "../../../shared/store/AppStoreModel.type";

@Injectable({
  providedIn: "root",
})
export class ManageUsagersService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

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
}
