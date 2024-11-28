import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerDecisionRadiationForm,
  UsagerDecisionRefusForm,
  UsagerDecisionValideForm,
  UsagerLight,
} from "../../../../_common/model";

import { usagerActions, UsagerState } from "../../../shared/store";
import { Store } from "@ngrx/store";
import { Usager } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class UsagerDecisionService {
  public endPointUsagers = environment.apiUrl + "usagers";
  public endPointDecision = environment.apiUrl + "usagers-decision";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<UsagerState>
  ) {}

  public renouvellement(
    usager: Pick<Usager, "ref" | "statut">
  ): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointDecision}/renouvellement/${usager.ref}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          if (usager.statut === "RADIE") {
            this.store.dispatch(
              usagerActions.updateUsagersRadiesTotalCount({
                action: "delete",
                numberOfChanges: 1,
              })
            );
          }

          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
        })
      );
  }

  public deleteDecision(
    usager: Pick<Usager, "ref" | "statut">
  ): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(`${this.endPointDecision}/${usager.ref}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          if (usager.statut === "RADIE") {
            this.store.dispatch(
              usagerActions.updateUsagersRadiesTotalCount({
                action: "delete",
                numberOfChanges: 1,
              })
            );
          }

          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
        })
      );
  }

  public isDuplicateCustomRef(
    ref: number,
    customRef: string
  ): Observable<UsagerLight[]> {
    return this.http.post<UsagerLight[]>(
      `${this.endPointDecision}/check-duplicates-custom-ref/${ref}`,
      { customRef }
    );
  }

  public setDecision(
    usagerRef: number,
    decision:
      | UsagerDecisionRadiationForm
      | UsagerDecisionRefusForm
      | UsagerDecisionValideForm
      | { statut: "ATTENTE_DECISION" }
      | { statut: "INSTRUCTION" },
    updateStore: boolean = true
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPointDecision}/${usagerRef}`, decision)
      .pipe(
        tap((newUsager: UsagerLight) => {
          if (updateStore) {
            if (decision.statut === "RADIE") {
              this.store.dispatch(
                usagerActions.updateUsagersRadiesTotalCount({
                  action: "add",
                  numberOfChanges: 1,
                })
              );
            }
            this.store.dispatch(
              usagerActions.updateUsager({ usager: newUsager })
            );
          }
        })
      );
  }

  public getLastFiveCustomRef(usagerRef: number): Observable<UsagerLight[]> {
    return this.http.get<UsagerLight[]>(
      this.endPointDecision + "/last-usagers-refs/" + usagerRef
    );
  }
}
