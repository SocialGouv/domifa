import { cacheManager } from "./../../../shared/store/ngRxUsagersCache.service";
import { RdvForm } from "./../../../../_common/model/usager/rdv/RdvForm.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  Usager,
  UsagerEtatCivilFormData,
  UsagerLight,
  UserStructure,
} from "../../../../_common/model";

import { userStructureBuilder } from "../../users/services";
import { Store } from "@ngrx/store";

@Injectable({
  providedIn: "root",
})
export class UsagerDossierService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient, private store: Store) {}

  public editStepEtatCivil(
    usager: UsagerEtatCivilFormData,
    ref: number
  ): Observable<UsagerLight> {
    if (ref !== 0 && ref !== null) {
      return this.http
        .patch<UsagerLight>(`${this.endPointUsagers}/${ref}`, usager)
        .pipe(
          tap({
            next: (newUsager: UsagerLight) => {
              this.store.dispatch(
                cacheManager.updateUsager({ usager: newUsager })
              );
              return newUsager;
            },
          })
        );
    }

    return this.http.post<Usager>(`${this.endPointUsagers}`, usager).pipe(
      tap({
        next: (newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.addUsager({ usager: newUsager }));
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
        tap({
          next: (newUsager: UsagerLight) => {
            this.store.dispatch(
              cacheManager.updateUsager({ usager: newUsager })
            );
            return newUsager;
          },
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
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
          return newUsager;
        })
      );
  }

  public isDuplicateName(params: {
    nom: string;
    prenom: string;
    usagerRef: number | null;
  }) {
    return this.http.post<UsagerLight[]>(
      `${this.endPointUsagers}/check-duplicates-name`,
      params
    );
  }

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public getAllUsersForAgenda(): Observable<UserStructure[]> {
    return this.http.get(environment.apiUrl + "agenda/users").pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) =>
              userStructureBuilder.buildUserStructure(item)
            )
          : [userStructureBuilder.buildUserStructure(response)];
      })
    );
  }
}
