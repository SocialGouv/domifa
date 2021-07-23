import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  UsagerLight,
  UsagerPreferenceContact,
} from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class UsagerProfilService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(public http: HttpClient) {
    this.http = http;
  }

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`);
  }

  public delete(usagerRef: number) {
    return this.http.delete(`${this.endPointUsagers}/${usagerRef}`);
  }

  public renouvellement(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/renouvellement/${usagerRef}`
    );
  }

  public deleteRenew(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(
        `${this.endPointUsagers}/renouvellement/${usagerRef}`
      )
      .pipe();
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

  public stopCourrier(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/stop-courrier/${usagerRef}`
    );
  }
}
