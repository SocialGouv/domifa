import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImportDocumentType } from "@domifa/common";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

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
    importDocumentType: ImportDocumentType
  ): Promise<void> {
    const logActionUrl = `${environment.apiUrl}import/log-document-download/${importDocumentType}`;
    return lastValueFrom(this.http.get<void>(logActionUrl));
  }
}
