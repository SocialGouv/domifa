import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerEtatCivilFormData,
  UsagerLight,
} from "../../../../_common/model";

import { Store } from "@ngrx/store";
import { Usager } from "@domifa/common";
import { usagerActions, UsagerState } from "../../../shared";
import { RdvForm } from "../types";

@Injectable({
  providedIn: "root",
})
export class UsagerDossierService {
  public endPointUsagers = `${environment.apiUrl}usagers`;

  constructor(
    private readonly http: HttpClient,
    private store: Store<UsagerState>
  ) {}

  public editStepEtatCivil(
    usager: UsagerEtatCivilFormData,
    ref: number
  ): Observable<Usager> {
    if (ref !== 0 && ref !== null) {
      return this.http
        .patch<Usager>(`${this.endPointUsagers}/${ref}`, usager)
        .pipe(
          tap({
            next: (newUsager: Usager) => {
              this.store.dispatch(
                usagerActions.updateUsager({ usager: newUsager })
              );
              return newUsager;
            },
          })
        );
    }

    return this.http.post<Usager>(`${this.endPointUsagers}`, usager).pipe(
      tap({
        next: (newUsager: Usager) => {
          this.store.dispatch(usagerActions.addUsager({ usager: newUsager }));
          return newUsager;
        },
      })
    );
  }

  // RDV maintenant : on passe l'étape du formulaire
  public setRdv(rdv: RdvForm, usagerRef: number): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${environment.apiUrl}agenda/${usagerRef}`, rdv)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
        })
      );
  }

  public nextStep(
    usagerRef: number,
    etapeDemande: number
  ): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(
        `${this.endPointUsagers}/next-step/${usagerRef}/${etapeDemande}`
      )
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
          return newUsager;
        })
      );
  }

  public isDuplicateName(params: {
    nom: string;
    prenom: string;
  }): Observable<UsagerLight[]> {
    return this.http.post<UsagerLight[]>(
      `${this.endPointUsagers}/check-duplicates-name`,
      params
    );
  }

  public findOne(usagerRef: number): Observable<Usager> {
    return this.http.get<Usager>(`${this.endPointUsagers}/${usagerRef}`).pipe(
      tap((newUsager: Usager) => {
        this.store.dispatch(usagerActions.updateUsager({ usager: newUsager }));
      })
    );
  }
}
