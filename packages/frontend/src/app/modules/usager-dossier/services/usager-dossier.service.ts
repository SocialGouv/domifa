import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { UsagerDecisionForm } from "../../../../_common/model/usager/UsagerDecisionForm.type";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersSearchCache } from "../../../shared/store";
import { Rdv } from "../../usager-shared/interfaces/rdv";
import { UsagerFormModel } from "../../usager-shared/interfaces/UsagerFormModel";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerDossierService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public create(usager: UsagerFormModel): Observable<UsagerLight> {
    const response =
      usager.ref !== 0
        ? this.http
            .patch<UsagerLight>(`${this.endPointUsagers}/${usager.ref}`, usager)
            .pipe(
              tap((newUsager: UsagerLight) => {
                usagersSearchCache.updateUsager(newUsager);
                return newUsager;
              })
            )
        : this.http.post<UsagerLight>(`${this.endPointUsagers}`, usager).pipe(
            tap((newUsager: UsagerLight) => {
              usagersSearchCache.createUsager(newUsager);
              return newUsager;
            })
          );

    return response;
  }

  // RDV maintenant : on passe l'étape du formulaire
  public setRdv(
    rdv: Pick<Rdv, "userId" | "dateRdv" | "isNow">,
    usagerRef: number
  ): Observable<UsagerLight> {
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

  public deleteRenew(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPointUsagers}/renouvellement/${usagerRef}`
    );
  }

  public setDecision(
    usagerRef: number,
    decision: UsagerDecisionForm
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(
        `${this.endPointUsagers}/decision/${usagerRef}`,
        decision
      )
      .pipe(
        tap((usager: UsagerLight) => {
          usagersSearchCache.updateUsager(usager);
        })
      );
  }

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        startWith(
          usagersSearchCache
            .getUsagersSnapshot()
            ?.find((x) => x.ref === usagerRef)
        ),
        filter((x) => !!x)
      );
  }

  public isDoublon(nom: string, prenom: string, usagerRef: number) {
    return this.http.get<UsagerLight[]>(
      `${this.endPointUsagers}/doublon/${nom}/${prenom}/${usagerRef}`
    );
  }
}
