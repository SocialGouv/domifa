import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, Observable, startWith, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import { MessageSms, UsagerLight } from "../../../../_common/model";
import { usagersCache } from "../../../shared/store";

@Injectable({
  providedIn: "root",
})
export class UsagerProfilService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private readonly http: HttpClient) {}

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        tap((x: UsagerLight) =>
          // update cache
          usagersCache.updateUsager(x)
        ),
        startWith(usagersCache.getSnapshot().usagersByRefMap[usagerRef]), // try to load value from cache
        filter((x) => !!x) // filter out empty cache value
      );
  }

  public delete(usagerRef: number) {
    return this.http.delete(`${this.endPointUsagers}/${usagerRef}`).pipe(
      tap(() => {
        usagersCache.removeUsager({ ref: usagerRef });
      })
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
    return this.http.post<{
      usager: UsagerLight;
      login?: string;
      temporaryPassword?: string;
    }>(`${this.endPointUsagers}/portail-usager/options/${usagerRef}`, options);
  }

  public stopCourrier(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/stop-courrier/${usagerRef}`
    );
  }

  public findMySms(ref: number): Observable<MessageSms[]> {
    return this.http.get<MessageSms[]>(
      environment.apiUrl + "sms/usager/" + ref.toString()
    );
  }
}
