import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Entretien } from '../interfaces/entretien';
import { Rdv } from '../interfaces/rdv';
import { Usager } from '../interfaces/usager';

@Injectable()
export class UsagerService {

  public http: HttpClient;
  private usager = null;
  private endPoint = environment.apiUrl+'usagers';

  constructor(http: HttpClient) {
    this.http = http;
  }

  /* Ajout d'un domicilié */
  public create(usager: Usager) {
    return  usager.id !== 0 ? this.http.patch(`${this.endPoint}`, usager) : this.http.post(`${this.endPoint}`, usager);
  };

  /* Ajout d'un rendez-vous */
  public createRdv(rdv: Rdv, idUsager: number) {
    return this.http.post(`${this.endPoint}/rdv/${idUsager}`, rdv);
  };

  /* Ajout d'un rendez-vous */
  public entretien(entretien: Entretien, idUsager: number){
    return this.http.post(`${this.endPoint}/entretien/${idUsager}`, entretien);
  };

  /* Ajout d'un rendez-vous */
  public setDecision(idUsager: number, decision: any, statut: string) {
    decision.statut = statut;
    return this.http.post(`${this.endPoint}/decision/${idUsager}`, decision);
  };

  public findOne(idUsager: number){
    return this.http.get(`${this.endPoint}/${idUsager}`);
  };

  /* Recherche */
  public search(filters?: {}) {
    let httpParams = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null) {
        httpParams = httpParams.append(key, filters[key])
      }
    });
    return this.http.get(`${this.endPoint}/search/`, { params : httpParams });
  };

  /* Attestation */
  public attestation(idUsager: number) {
    this.http.get(`${this.endPoint}/attestation/${idUsager}`, { responseType: 'blob' }).subscribe( x => {
      const newBlob = new Blob([x], { type: "application/pdf" });

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }
      const data = window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      const randomNumber = Math.floor(Math.random() * 100) + 1;

      link.href = data;
      link.download = "attestation_" + idUsager+"_"+randomNumber+".pdf";
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));


      setTimeout( ( ) => {
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);
    }
    );
  };
}
