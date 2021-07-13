import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { filter, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerPreferenceContact } from "../../../../_common/model";
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

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    private notifService: ToastrService,
    private matomo: MatomoTracker
  ) {}

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

  public editTransfert(
    // TODO: type it
    transfert: any,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/transfert/${usagerRef}`,
      transfert
    );
  }

  // Mise à jour des préférence de contact
  public editPreference(
    preference: UsagerPreferenceContact,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/preference/${usagerRef}`,
      preference
    );
  }

  public deleteTransfert(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPointUsagers}/transfert/${usagerRef}`
    );
  }

  public editProcuration(
    procuration: any,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/procuration/${usagerRef}`,
      procuration
    );
  }

  public deleteProcuration(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPointUsagers}/procuration/${usagerRef}`
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

  public stopCourrier(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/stop-courrier/${usagerRef}`
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

  public delete(usagerRef: number) {
    return this.http.delete(`${this.endPointUsagers}/${usagerRef}`).pipe(
      tap(() => {
        usagersSearchCache.removeUsagersByCriteria({ ref: usagerRef });
      })
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

  /* Attestation */
  public attestation(usagerRef: number): void {
    this.loadingService.startLoading();

    this.matomo.trackEvent("stats", "telechargement_cerfa", "null", 1);

    this.http
      .get(`${this.endPointUsagers}/attestation/${usagerRef}`, {
        responseType: "blob",
      })
      .subscribe(
        (x) => {
          const newBlob = new Blob([x], { type: "application/pdf" });
          const randomNumber = Math.floor(Math.random() * 100) + 1;

          saveAs(
            newBlob,
            "attestation_" + usagerRef + "_" + randomNumber + ".pdf"
          );

          setTimeout(() => {
            this.loadingService.stopLoading();
          }, 500);
        },
        () => {
          this.notifService.error(
            "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.loadingService.stopLoading();
        }
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
}
