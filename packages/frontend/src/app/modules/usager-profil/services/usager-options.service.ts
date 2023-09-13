import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  UsagerOptionsHistory,
  UsagerOptionsTransfert,
  UsagerLight,
} from "../../../../_common/model";
import { cacheManager } from "../../../shared";
import { Store } from "@ngrx/store";
import {
  UsagerOptionsHistoryType,
  UsagerOptionsProcuration,
} from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class UsagerOptionsService {
  public endPoint = environment.apiUrl + "usagers-options/";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

  public findHistory(
    usagerRef: number,
    typeOfOptions: UsagerOptionsHistoryType
  ): Observable<UsagerOptionsHistory[]> {
    return this.http.get<UsagerOptionsHistory[]>(
      `${this.endPoint}historique/${usagerRef}/${typeOfOptions}`
    );
  }

  public editTransfert(
    transfert: UsagerOptionsTransfert,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPoint}transfert/${usagerRef}`, transfert)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public deleteTransfert(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(`${this.endPoint}transfert/${usagerRef}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public editProcurations(
    procurations: UsagerOptionsProcuration[],
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(
        `${this.endPoint}procuration/${usagerRef}`,
        procurations
      )
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public deleteProcuration(
    usagerRef: number,
    indexProcuration: number
  ): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(
        `${this.endPoint}procuration/${usagerRef}/${indexProcuration}`
      )
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }
}
