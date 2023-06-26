import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerEtatCivilFormData,
  UsagerLight,
} from "../../../../_common/model";
import { cacheManager } from "../../../shared/store";
import { Entretien } from "../interfaces";
import { Store } from "@ngrx/store";

@Injectable({
  providedIn: "root",
})
export class UsagerService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient, private store: Store) {}

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public submitEntretien(
    entretien: Entretien,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(
        `${this.endPointUsagers}/entretien/${usagerRef}`,
        entretien
      )
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
          return newUsager;
        })
      );
  }
  public patchEtatCivil(
    ref: number,
    usager: UsagerEtatCivilFormData
  ): Observable<UsagerLight> {
    return this.http
      .patch<UsagerLight>(`${this.endPointUsagers}/${ref}`, usager)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
          return newUsager;
        })
      );
  }
}
