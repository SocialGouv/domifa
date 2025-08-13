import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, tap } from "rxjs";
import { UsagerLight } from "../../../../_common/model";
import { environment } from "../../../../environments/environment";
import { usagerActions, UsagerState } from "../../../shared";
import { UserUsager } from "@domifa/common";

export type PortailUsagersInformations = Pick<
  UserUsager,
  | "updatedAt"
  | "login"
  | "isTemporaryPassword"
  | "lastLogin"
  | "passwordLastUpdate"
>;
@Injectable({
  providedIn: "root",
})
export class PortailUsagersService {
  public endPointUsagers = environment.apiUrl + "portail-usagers-manager";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<UsagerState>
  ) {}

  public getPortailUsagersInformations(
    usagerRef: number
  ): Observable<PortailUsagersInformations | null> {
    return this.http.get<PortailUsagersInformations | null>(
      `${this.endPointUsagers}/${usagerRef}`
    );
  }

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
    return this.http
      .post<{
        usager: UsagerLight;
        login?: string;
        temporaryPassword?: string;
      }>(`${this.endPointUsagers}/enable-access/${usagerRef}`, options)
      .pipe(
        tap((result: { usager: UsagerLight }) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: result.usager })
          );
        })
      );
  }
}
