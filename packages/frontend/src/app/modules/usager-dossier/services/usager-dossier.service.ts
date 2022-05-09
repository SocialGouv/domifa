import { RdvForm } from "./../../../../_common/model/usager/rdv/RdvForm.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerLight, UserStructure } from "../../../../_common/model";

import { usagersCache } from "../../../shared/store";

import { UsagerFormModel } from "../../usager-shared/interfaces/UsagerFormModel";
import { userStructureBuilder } from "../../users/services";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerDossierService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public createUsager(usager: UsagerFormModel): Observable<UsagerLight> {
    // TODO: éditer ce type pour ne conserver que les champs utiles
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

  public isDoublon(nom: string, prenom: string, usagerRef: number) {
    return this.http.get<UsagerLight[]>(
      `${this.endPointUsagers}/doublon/${nom}/${prenom}/${usagerRef}`
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
