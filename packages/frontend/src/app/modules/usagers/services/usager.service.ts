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
import { LoadingService } from "../../loading/loading.service";
import { Decision } from "../interfaces/decision";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";
import { Search } from "../interfaces/search";
import { Usager } from "../interfaces/usager";

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

  public create(usager: Usager): Observable<Usager> {
    const response =
      usager.id !== 0
        ? this.http.patch(`${this.endPointUsagers}/${usager.id}`, usager)
        : this.http.post(`${this.endPointUsagers}`, usager);

    return response.pipe(
      map((updatedUsager) => {
        return new Usager(updatedUsager);
      })
    );
  }

  public createRdv(
    rdv: Pick<Rdv, "userId" | "dateRdv" | "isNow">,
    usagerId: number
  ): Observable<Usager> {
    return this.http.post(`${environment.apiUrl}agenda/${usagerId}`, rdv).pipe(
      map((response) => {
        return new Usager(response);
      })
    );
  }

  public editTransfert(transfert: any, usagerId: number): Observable<Usager> {
    return this.http
      .post(`${this.endPointUsagers}/transfert/${usagerId}`, transfert)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public deleteTransfert(usagerId: number): Observable<Usager> {
    return this.http
      .delete(`${this.endPointUsagers}/transfert/${usagerId}`)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public editProcuration(transfert: any, usagerId: number): Observable<Usager> {
    return this.http
      .post(`${this.endPointUsagers}/procuration/${usagerId}`, transfert)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public deleteProcuration(usagerId: number): Observable<Usager> {
    return this.http
      .delete(`${this.endPointUsagers}/procuration/${usagerId}`)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public deleteRenew(usagerId: number): Observable<Usager> {
    return this.http.delete(`${this.endPointUsagers}/renew/${usagerId}`).pipe(
      map((response) => {
        return new Usager(response);
      })
    );
  }

  public nextStep(usagerId: number, etapeDemande: number): Observable<Usager> {
    return this.http
      .get(`${this.endPointUsagers}/next-step/${usagerId}/${etapeDemande}`)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public stopCourrier(usagerId: number): Observable<Usager> {
    return this.http
      .get(`${this.endPointUsagers}/stop-courrier/${usagerId}`)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public renouvellement(usagerId: number): Observable<Usager> {
    return this.http
      .get(`${this.endPointUsagers}/renouvellement/${usagerId}`)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public entretien(entretien: Entretien, usagerId: number): Observable<Usager> {
    return this.http
      .post(`${this.endPointUsagers}/entretien/${usagerId}`, entretien)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public setDecision(
    usagerId: number,
    decision: Decision,
    statut: string
  ): Observable<Usager> {
    decision.statut = statut;
    delete decision.userId;
    delete decision.userName;

    return this.http
      .post(`${this.endPointUsagers}/decision/${usagerId}`, decision)
      .pipe(
        map((response) => {
          return new Usager(response);
        })
      );
  }

  public findOne(usagerId: number): Observable<Usager> {
    return this.http.get(`${this.endPointUsagers}/${usagerId}`).pipe(
      map((response) => {
        return new Usager(response);
      })
    );
  }

  public isDoublon(nom: string, prenom: string, usagerId: number) {
    return this.http
      .get(`${this.endPointUsagers}/doublon/${nom}/${prenom}/${usagerId}`)
      .pipe(
        map((response) => {
          return Array.isArray(response)
            ? response.map((item) => new Usager(item))
            : [new Usager(response)];
        })
      );
  }

  public delete(usagerId: number) {
    return this.http.delete(`${this.endPointUsagers}/${usagerId}`);
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
  public attestation(usagerId: number): void {
    this.loadingService.startLoading();

    this.matomo.trackEvent("stats", "telechargement_cerfa", "null", 1);

    this.http
      .get(`${this.endPointUsagers}/attestation/${usagerId}`, {
        responseType: "blob",
      })
      .subscribe(
        (x) => {
          const newBlob = new Blob([x], { type: "application/pdf" });
          const randomNumber = Math.floor(Math.random() * 100) + 1;

          saveAs(
            newBlob,
            "attestation_" + usagerId + "_" + randomNumber + ".pdf"
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
