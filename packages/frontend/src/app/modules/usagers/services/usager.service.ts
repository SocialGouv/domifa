import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { MessageSms } from "../../../../_common/model/message-sms";
import { UsagerDecisionForm } from "../../../../_common/model/usager/UsagerDecisionForm.type";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersSearchCache } from "../../../shared/store";
import { LoadingService } from "../../loading/loading.service";
import { UsagerFormModel } from "../components/form/UsagerFormModel";
import { ImportPreviewTable } from "../components/import/preview";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public create(usager: UsagerFormModel): Observable<UsagerLight> {
    const response =
      usager.ref !== 0
        ? this.http
            .patch<UsagerLight>(`${this.endPointUsagers}/${usager.ref}`, usager)
            .pipe(
              tap((usager: UsagerLight) => {
                usagersSearchCache.updateUsager(usager);
              })
            )
        : this.http.post<UsagerLight>(`${this.endPointUsagers}`, usager).pipe(
            tap((usager: UsagerLight) => {
              usagersSearchCache.createUsager(usager);
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

  public entretien(
    entretien: Entretien,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(
        `${this.endPointUsagers}/entretien/${usagerRef}`,
        entretien
      )
      .pipe(
        tap((usager: UsagerLight) => {
          usagersSearchCache.updateUsager(usager);
        })
      );
  }

  public renouvellement(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/renouvellement/${usagerRef}`
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

  /* Recherche */
  public getAllUsagers(): Observable<UsagerLight[]> {
    return this.http.get<UsagerLight[]>(`${environment.apiUrl}usagers/`).pipe(
      tap((usagers: UsagerLight[]) => {
        usagersSearchCache.setUsagers(usagers);
      }),
      startWith(usagersSearchCache.getUsagersSnapshot()),
      filter((x) => !!x)
    );
  }

  public import(
    mode: UsagersImportMode,
    data: FormData
  ): Observable<{
    importMode: UsagersImportMode;
    previewTable: ImportPreviewTable;
  }> {
    return this.http.post<any>(environment.apiUrl + "import/" + mode, data);
  }

  public findMySms(usager: UsagerLight): Observable<MessageSms[]> {
    return this.http.get(environment.apiUrl + "sms/usager/" + usager.ref).pipe(
      map((res: MessageSms[]) => {
        return res;
      })
    );
  }
}
