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

  // Server time of the last known state, so that a refresh never skips a change
  private syncCursor: string | null = null;

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
      .get<{
        usagers: UsagerLight[];
        usagersRadiesTotalCount: number;
        syncedAt: string;
      }>(`${this.endPoint}?chargerTousRadies=${chargerTousRadies}`)
      .pipe(
        map(
          (data: {
            usagers: UsagerLight[];
            usagersRadiesTotalCount: number;
            syncedAt: string;
          }) => {
            this.syncCursor = data.syncedAt;
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

  public hasSyncCursor(): boolean {
    return this.syncCursor !== null;
  }

  public updateManage(): Observable<UsagerLight[]> {
    return this.http
      .get<UsagerLight[]>(`${this.endPoint}update-manage`, {
        params: { since: this.syncCursor },
      })
      .pipe(
        tap((usagers: UsagerLight[]) => {
          if (usagers?.length) {
            this.syncCursor = this.latestUpdatedAt(usagers, this.syncCursor);
            this.store.dispatch(
              usagerActions.updateManyUsagersForManage({ usagers })
            );
          }
        })
      );
  }

  private latestUpdatedAt(usagers: UsagerLight[], current: string): string {
    let latest = current;
    for (const usager of usagers) {
      const updatedAt = new Date(usager.updatedAt).toISOString();
      if (updatedAt > latest) {
        latest = updatedAt;
      }
    }
    return latest;
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
