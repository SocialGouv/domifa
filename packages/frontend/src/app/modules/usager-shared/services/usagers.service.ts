import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { filter, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerEtatCivilFormData,
  UsagerLight,
} from "../../../../_common/model";
import { usagersCache } from "../../../shared/store";
import { Entretien } from "../interfaces";

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
        tap((x: UsagerLight) =>
          // update cache
          usagersCache.updateUsager(x)
        ),
        startWith(usagersCache.getSnapshot().usagersByRefMap[usagerRef]), // try to load value from cache
        filter((x) => !!x) // filter out empty cache value
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
          usagersCache.updateUsager(newUsager);
          return newUsager;
        })
      );
  }
  public patchEtatCivil(
    ref: number,
    usager: UsagerEtatCivilFormData
  ): Observable<UsagerLight> {
    const response = this.http
      .patch<UsagerLight>(`${this.endPointUsagers}/${ref}`, usager)
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersCache.updateUsager(newUsager);
          return newUsager;
        })
      );
    return response;
  }
}
