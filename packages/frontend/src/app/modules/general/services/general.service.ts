import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "src/environments/environment";
export enum TYPE_CONSULTATION_DOCUMENT {
  GUIDE = "guide",
  MODELE = "modele",
}
@Injectable({
  providedIn: "root",
})
export class GeneralService {
  constructor(private readonly http: HttpClient) {}

  public sendContact(data: FormData): Observable<boolean> {
    const uploadURL = `${environment.apiUrl}contact`;
    return this.http.post<boolean>(uploadURL, data);
  }

  public logDownloadAction(
    typeConsultationDocument: TYPE_CONSULTATION_DOCUMENT
  ): Promise<void> {
    const logActionUrl = `${environment.apiUrl}structures/consultation-document/${typeConsultationDocument}`;
    return lastValueFrom(this.http.get<void>(logActionUrl));
  }
}
