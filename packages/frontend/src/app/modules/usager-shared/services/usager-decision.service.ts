import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerDecision,
  UsagerDecisionRadiationForm,
  UsagerDecisionRefusForm,
  UsagerDecisionValideForm,
  UsagerHistoryState,
  UsagerLight,
} from "../../../../_common/model";

import { usagersCache } from "../../../shared/store";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerDecisionService {
  public endPointUsagers = environment.apiUrl + "usagers";
  public endPointDecision = environment.apiUrl + "usagers-decision";

  constructor(private http: HttpClient) {}
  public renouvellement(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointDecision}/renouvellement/${usagerRef}`)
      .pipe(
        tap((usager: UsagerLight) => {
          usagersCache.updateUsager(usager);
        })
      );
  }

  public deleteRenew(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(
        `${this.endPointDecision}/renouvellement/${usagerRef}`
      )
      .pipe(
        tap((usager: UsagerLight) => {
          usagersCache.updateUsager(usager);
        })
      );
  }

  public setDecision(
    usagerRef: number,
    decision:
      | UsagerDecisionRadiationForm
      | UsagerDecisionRefusForm
      | UsagerDecisionValideForm
      | { statut: "ATTENTE_DECISION" }
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPointDecision}/${usagerRef}`, decision)
      .pipe(
        tap((usager: UsagerLight) => {
          usagersCache.updateUsager(usager);
        })
      );
  }

  public getHistoriqueDecisions(
    usagerRef: number
  ): Observable<UsagerHistoryState[]> {
    return this.http.get<UsagerHistoryState[]>(
      `${this.endPointDecision}/historique/${usagerRef}`
    );
  }

  public getLastFiveCustomRef(usagerRef: number): Observable<UsagerLight[]> {
    return this.http
      .get(this.endPointDecision + "/last-usagers-refs/" + usagerRef)
      .pipe(
        map((response) => {
          return Array.isArray(response)
            ? response.map((item) => item as UsagerLight)
            : [response as UsagerLight];
        })
      );
  }
}
