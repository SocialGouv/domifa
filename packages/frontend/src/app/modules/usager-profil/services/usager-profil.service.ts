import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  UsagerLight,
  UsagerPreferenceContact,
} from "../../../../_common/model";
import { usagersCache } from "../../../shared/store";
import { UsagerService } from "../../usagers/services/usager.service";

@Injectable({
  providedIn: "root",
})
export class UsagerProfilService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(public http: HttpClient, public usagerService: UsagerService) {
    this.http = http;
  }

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.usagerService.findOne(usagerRef);
  }

  public delete(usagerRef: number) {
    return this.http.delete(`${this.endPointUsagers}/${usagerRef}`).pipe(
      tap(() => {
        usagersCache.removeUsager({ ref: usagerRef });
      })
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

  // Mise à jour des préférence de contact
  public editSmsPreference(
    preference: UsagerPreferenceContact,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/preference/${usagerRef}`,
      preference
    );
  }

  // Mise à jour des préférence de contact
  public updatePortailUsagerOptions({
    usagerRef,
    options,
  }: {
    usagerRef: number;
    options: {
      portailUsagerEnabled: boolean;
      generateNewPassword: boolean;
    };
  }): Observable<{
    usager: UsagerLight;
    login?: string;
    temporaryPassword?: string;
  }> {
    return this.http.post<any>(
      `${this.endPointUsagers}/portail-usager/options/${usagerRef}`,
      options
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
