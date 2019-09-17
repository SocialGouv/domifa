import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { environment } from "src/environments/environment";
import { LoadingService } from "../../loading/loading.service";
import { User } from "../../users/interfaces/user";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";
import { Usager } from "../interfaces/usager";

@Injectable()
export class UsagerService {
  public http: HttpClient;
  public loading: boolean;
  public user: User;
  public endPointUsagers = environment.apiUrl + "usagers";
  public endPointInteractions = environment.apiUrl + "interactions/";

  constructor(
    http: HttpClient,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    this.http = http;
    this.loading = true;
    this.user = this.authService.currentUserValue;
  }

  /* Ajout d'un domicilié */
  public create(usager: Usager) {
    return usager.id !== 0
      ? this.http.patch(`${this.endPointUsagers}`, usager)
      : this.http.post(`${this.endPointUsagers}`, usager);
  }

  /* Ajout d'un rendez-vous */
  public createRdv(rdv: Rdv, idUsager: number) {
    return this.http.post(`${this.endPointUsagers}/rdv/${idUsager}`, rdv);
  }

  /* Ajout d'un rendez-vous */
  public entretien(entretien: Entretien, idUsager: number) {
    return this.http.post(
      `${this.endPointUsagers}/entretien/${idUsager}`,
      entretien
    );
  }

  /* Ajout d'un rendez-vous */
  public setDecision(idUsager: number, decision: any, statut: string) {
    decision.statut = statut;
    return this.http.post(
      `${this.endPointUsagers}/decision/${idUsager}`,
      decision
    );
  }

  public findOne(idUsager: number) {
    return this.http.get(`${this.endPointUsagers}/${idUsager}`);
  }

  public isDoublon(nom: string, prenom: string) {
    return this.http.get(`${this.endPointUsagers}/doublon/${nom}/${prenom}`);
  }

  /* Recherche */
  public search(filters?: {}) {
    let httpParams = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null) {
        httpParams = httpParams.append(key, filters[key]);
      }
    });
    return this.http.get(`${this.endPointUsagers}/search/`, {
      params: httpParams
    });
  }

  public setInteraction(idUsager: number, interaction?: any) {
    return this.http.post(
      environment.apiUrl + `interactions/${idUsager}`,
      interaction
    );
  }

  public getInteractions(idUsager: number) {
    return this.http.get(environment.apiUrl + `interactions/${idUsager}/10`);
  }

  public setPassage(idUsager: number, type: string) {
    return this.http.post(
      environment.apiUrl + `interactions/${idUsager}/${type}`,
      {}
    );
  }

  /* Attestation */
  public attestation(idUsager: number) {
    this.loadingService.startLoading();

    this.http
      .get(`${this.endPointUsagers}/attestation/${idUsager}`, {
        responseType: "blob"
      })
      .subscribe(x => {
        const newBlob = new Blob([x], { type: "application/pdf" });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }
        const data = window.URL.createObjectURL(newBlob);
        const link = document.createElement("a");
        const randomNumber = Math.floor(Math.random() * 100) + 1;

        link.href = data;
        link.download = "attestation_" + idUsager + "_" + randomNumber + ".pdf";
        link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        setTimeout(() => {
          window.URL.revokeObjectURL(data);
          link.remove();
          this.loadingService.stopLoading();
        }, 500);
      });
  }
}
