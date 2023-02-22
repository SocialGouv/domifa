import { RdvForm } from "./../../../../_common/model/usager/rdv/RdvForm.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerEtatCivilFormData,
  UsagerLight,
  UserStructure,
} from "../../../../_common/model";

import { usagersCache } from "../../../shared/store";

import { userStructureBuilder } from "../../users/services";

@Injectable({
  providedIn: "root",
})
export class UsagerDossierService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public editStepEtatCivil(
    usager: UsagerEtatCivilFormData,
    ref: number
  ): Observable<UsagerLight> {
    // Edition d'une fiche
    if (ref !== 0 && ref !== null) {
      return this.http
        .patch<UsagerLight>(`${this.endPointUsagers}/${ref}`, usager)
        .pipe(
          tap((newUsager: UsagerLight) => {
            usagersCache.updateUsager(newUsager);
            return newUsager;
          })
        );
    }

    // Création
    return this.http.post<UsagerLight>(`${this.endPointUsagers}`, usager).pipe(
      tap((newUsager: UsagerLight) => {
        usagersCache.createUsager(newUsager);
        return newUsager;
      })
    );
  }

  // RDV maintenant : on passe l'étape du formulaire
  public setRdv(rdv: RdvForm, usagerRef: number): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${environment.apiUrl}agenda/${usagerRef}`,
      rdv
    );
  }

  public nextStep(
    usagerRef: number,
    etapeDemande: number
  ): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/next-step/${usagerRef}/${etapeDemande}`
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
        tap((x: UsagerLight) =>
          // update cache
          usagersCache.updateUsager(x)
        ),
        startWith(usagersCache.getSnapshot().usagersByRefMap[usagerRef]), // try to load value from cache
        filter((x) => !!x) // filter out empty cache value
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
