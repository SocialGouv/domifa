import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UsagerDoc } from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UsagerDocService {
  public endPoint = `${environment.apiUrl}portail-usagers/profile/`;

  constructor(private readonly http: HttpClient) {}

  public downloadDocument(uuid: string): Observable<Blob> {
    return this.http.get(`${this.endPoint}download-document/${uuid}`, {
      responseType: "blob",
    });
  }

  public getDocuments(): Observable<UsagerDoc[]> {
    return this.http.get<UsagerDoc[]>(`${this.endPoint}documents`);
  }
}
