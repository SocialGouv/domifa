import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";

import { Store } from "@ngrx/store";
import {
  setUsagerInformation,
  usagerActions,
  UsagerState,
} from "../../../shared";
import { UsagersFilterCriteria } from "../components/usager-filter";

@Injectable({
  providedIn: "root",
})
export class ManageUsagersService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<UsagerState>
  ) {}

  public fetchSearchPageUsagerData({
    chargerTousRadies,
  }: {
    chargerTousRadies: boolean;
  }): Observable<void> {
    return this.http
      .get<{ usagers: UsagerLight[]; usagersRadiesTotalCount: number }>(
        `${environment.apiUrl}usagers/?chargerTousRadies=${chargerTousRadies}`
      )
      .pipe(
        map(
          (data: {
            usagers: UsagerLight[];
            usagersRadiesTotalCount: number;
          }) => {
            return {
              usagers: data.usagers.map((usager) =>
                setUsagerInformation(usager)
              ),
              usagersRadiesTotalCount: data.usagersRadiesTotalCount,
            };
          }
        ),
        tap(({ usagers, usagersRadiesTotalCount }) => {
          this.store.dispatch(
            usagerActions.loadUsagersSuccess({
              usagers,
              usagersRadiesTotalCount,
            })
          );
        }),
        map(() => void 0) // Return void as specified in the return type
      );
  }

  public getSearchPageRemoteSearchRadies(
    filters: UsagersFilterCriteria
  ): Observable<string> {
    return this.http
      .post<UsagerLight[]>(
        `${environment.apiUrl}usagers/search-radies`,
        filters
      )
      .pipe(
        tap((usagers: UsagerLight[]) => {
          if (usagers?.length) {
            this.store.dispatch(
              usagerActions.updateManyUsagersForManage({ usagers })
            );
          }
        }),
        map(() => {
          return filters.searchString;
        })
      );
  }

  public updateManage(): Observable<UsagerLight[]> {
    return this.http
      .get<UsagerLight[]>(`${environment.apiUrl}usagers/update-manage`)
      .pipe(
        tap((usagers: UsagerLight[]) => {
          if (usagers?.length) {
            this.store.dispatch(
              usagerActions.updateManyUsagersForManage({ usagers })
            );
          }
        })
      );
  }
}
