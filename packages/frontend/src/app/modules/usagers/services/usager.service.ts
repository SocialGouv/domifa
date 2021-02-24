import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { UsagerDecisionForm } from "../../../../_common/model/usager/UsagerDecisionForm.type";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { LoadingService } from "../../loading/loading.service";
import { UsagerFormModel } from "../components/form/UsagerFormModel";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";

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
        ? this.http.patch<UsagerLight>(
            `${this.endPointUsagers}/${usager.ref}`,
            usager
          )
        : this.http.post<UsagerLight>(`${this.endPointUsagers}`, usager);

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
    transfert: any,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/transfert/${usagerRef}`,
      transfert
    );
  }

  public deleteTransfert(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPointUsagers}/transfert/${usagerRef}`
    );
  }

  public editProcuration(
    transfert: any,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/procuration/${usagerRef}`,
      transfert
    );
  }

  public deleteProcuration(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPointUsagers}/procuration/${usagerRef}`
    );
  }

  public deleteRenew(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(`${this.endPointUsagers}/renew/${usagerRef}`)
      .pipe();
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

  public renouvellement(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/renouvellement/${usagerRef}`
    );
  }

  public entretien(
    entretien: Entretien,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/entretien/${usagerRef}`,
      entretien
    );
  }

  public setDecision(
    usagerRef: number,
    decision: UsagerDecisionForm
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/decision/${usagerRef}`,
      decision
    );
  }

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe();
  }

  public isDoublon(nom: string, prenom: string, usagerRef: number) {
    return this.http.get<UsagerLight[]>(
      `${this.endPointUsagers}/doublon/${nom}/${prenom}/${usagerRef}`
    );
  }

  public delete(usagerRef: number) {
    return this.http.delete(`${this.endPointUsagers}/${usagerRef}`);
  }

  /* Recherche */
  public getAllUsagers(): Observable<UsagerLight[]> {
    return this.http.get<UsagerLight[]>(`${environment.apiUrl}usagers/`);
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

  public import(data: FormData): Observable<any> {
    return this.http.post(environment.apiUrl + "import", data);
  }
}
