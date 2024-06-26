import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import { UsagerLight } from "../../../../_common/model";
import { Store } from "@ngrx/store";
import { cacheManager } from "../../../shared";
import { ApiMessage, MessageSms } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class UsagerProfilService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public delete(usagerRef: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.endPointUsagers}/${usagerRef}`);
  }

  public stopCourrier(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/stop-courrier/${usagerRef}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(cacheManager.updateUsager({ usager: newUsager }));
        })
      );
  }

  public findMySms(ref: number): Observable<MessageSms[]> {
    return this.http.get<MessageSms[]>(
      environment.apiUrl + "sms/usager/" + ref.toString()
    );
  }
}
