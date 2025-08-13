import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Store } from "@ngrx/store";
import {
  setUsagerInformation,
  usagerActions,
  UsagerState,
} from "../../../shared";
import { UsagerLight } from "../../../../_common/model";
import { UsagersFilterCriteria } from "../classes";
import { UsagersCountByStatus } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class ManageUsagersService {
  public endPoint = environment.apiUrl + "search-usagers/";

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
        `${this.endPoint}?chargerTousRadies=${chargerTousRadies}`
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
      .post<UsagerLight[]>(`${this.endPoint}search-radies`, filters)
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
    return this.http.get<UsagerLight[]>(`${this.endPoint}update-manage`).pipe(
      tap((usagers: UsagerLight[]) => {
        if (usagers?.length) {
          this.store.dispatch(
            usagerActions.updateManyUsagersForManage({ usagers })
          );
        }
      })
    );
  }

  public countUsagersByStatuts(): Observable<UsagersCountByStatus> {
    return this.http.get<UsagersCountByStatus>(`${this.endPoint}count`);
  }

  // Assign new referrers
  public assignReferrers(
    usagersRefs: Set<number>,
    targetUserId: number | null
  ): Observable<UsagerLight[]> {
    return this.http
      .post<UsagerLight[]>(`${environment.apiUrl}usagers/assign-referrers`, {
        newReferrerId: targetUserId,
        usagersRefs: Array.from(usagersRefs),
      })
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
