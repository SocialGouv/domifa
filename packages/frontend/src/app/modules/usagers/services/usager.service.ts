import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpParams,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { LoadingService } from "../../loading/loading.service";
import { Decision } from "../interfaces/decision";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";
import { Search } from "../interfaces/search";

@Injectable({
  providedIn: "root",
})
export class UsagerService {
  public http: HttpClient;
  public loading: boolean;

  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(
    http: HttpClient,
    private loadingService: LoadingService,
    private notifService: ToastrService,
    private matomo: MatomoTracker
  ) {
    this.http = http;
    this.loading = true;
  }

  public create(usager: UsagerLight): Observable<UsagerLight> {
    const response =
      usager.ref !== 0
        ? this.http.patch<UsagerLight>(
            `${this.endPointUsagers}/${usager.ref}`,
            usager
          )
        : this.http.post<UsagerLight>(`${this.endPointUsagers}`, usager);

    return response;
  }

  public createRdv(
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
    decision: Decision,
    statut: string
  ): Observable<UsagerLight> {
    decision.statut = statut;
    delete decision.userId;
    delete decision.userName;

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

  public getStats() {
    return this.http.get(`${environment.apiUrl}search/stats`);
  }

  /* Recherche */
  public search(search: Search): Observable<any> {
    let data = new HttpParams();

    Object.keys(search).forEach((key) => {
      const value = search[key];
      if (value !== null) {
        data = data.append(key, value);
      }
    });

    return this.http.get(`${environment.apiUrl}search/`, { params: data });
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

  public import(data: FormData) {
    const uploadURL = environment.apiUrl + "import";
    return this.http
      .post<any>(uploadURL, data, {
        observe: "events",
        reportProgress: true,
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              return {
                message: progress,
                status: "progress",
              };
            }
          } else if (event.type === HttpEventType.Response) {
            return { success: true, body: event.body };
          }
          return `Unhandled event: ${event.type}`;
        })
      );
  }
}
