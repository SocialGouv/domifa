import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MonDomifaContactSubject } from "@domifa/common";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";

export interface MonDomifaContactPayload {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  regionCode: string;
  departement: string;
  structureName: string;
  subject: MonDomifaContactSubject;
  content: string;
}

@Injectable({
  providedIn: "root",
})
export class ContactMonDomifaService {
  private readonly endPoint = `${environment.apiUrl}contact/mon-domifa`;

  constructor(private readonly http: HttpClient) {}

  public sendContact(
    payload: MonDomifaContactPayload
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.endPoint, payload);
  }
}
