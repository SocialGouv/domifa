import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { cacheManager, setUsagerInformations } from "../../../shared/store";
import { SearchPageLoadedUsagersData } from "../../../shared/store/AppStoreModel.type";
import { Store } from "@ngrx/store";

@Injectable({
  providedIn: "root",
})
export class ManageUsagersService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

  public getSearchPageUsagerData({
    chargerTousRadies,
  }: {
    chargerTousRadies: boolean;
  }): Observable<SearchPageLoadedUsagersData> {
    // cacheManager.setSearchPageLoadedUsagersData({
    //   searchPageLoadedUsagersData: {
    //     usagersNonRadies: [],
    //     usagersRadiesFirsts: [],
    //     usagersRadiesTotalCount: 0,
    //     dataLoaded: false,
    //   },
    // });

    return this.http
      .get<SearchPageLoadedUsagersData>(
        `${environment.apiUrl}usagers/?chargerTousRadies=${chargerTousRadies}`
      )
      .pipe(
        map((searchPageLoadedUsagersData: SearchPageLoadedUsagersData) => {
          searchPageLoadedUsagersData.dataLoaded = true;
          searchPageLoadedUsagersData.usagersRadiesFirsts =
            searchPageLoadedUsagersData.usagersRadiesFirsts.map(
              (usager: UsagerLight) => setUsagerInformations(usager)
            );
          searchPageLoadedUsagersData.usagersNonRadies =
            searchPageLoadedUsagersData.usagersNonRadies.map(
              (usager: UsagerLight) => setUsagerInformations(usager)
            );
          return searchPageLoadedUsagersData;
        }),
        tap((searchPageLoadedUsagersData: SearchPageLoadedUsagersData) => {
          this.store.dispatch(
            cacheManager.setSearchPageLoadedUsagersData({
              searchPageLoadedUsagersData,
            })
          );
        })
      );
  }

  public getSearchPageRemoteSearchRadies({
    searchString,
  }: {
    searchString: string;
  }): Observable<string> {
    return this.http
      .post<UsagerLight[]>(`${environment.apiUrl}usagers/search-radies`, {
        searchString,
      })
      .pipe(
        tap((usagers: UsagerLight[]) => {
          this.store.dispatch(
            cacheManager.updateUsagers({
              usagers: usagers.map((usager: UsagerLight) =>
                setUsagerInformations(usager)
              ),
            })
          );
        }),
        map(() => {
          return searchString;
        })
      );
  }
}
