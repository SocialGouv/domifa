import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import * as Sentry from "@sentry/browser";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  PortailUsagerAuthApiResponse,
  PortailUsagerAuthLoginForm,
  PortailUsagerProfile,
} from "../../../../_common";
import { DEFAULT_USAGER_PROFILE } from "../../../../_common/mocks/DEFAULT_USAGER.const";

const END_POINT_AUTH = environment.apiUrl + "usagers/auth";

const TOKEN_KEY = "usager-auth-token";
const USER_KEY = "usager-auth-datas";

@Injectable({
  providedIn: "root",
})
export class UsagerAuthService {
  public currentUsagerSubject: BehaviorSubject<PortailUsagerProfile | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {
    this.currentUsagerSubject =
      new BehaviorSubject<PortailUsagerProfile | null>(DEFAULT_USAGER_PROFILE);
  }

  public login(loginForm: PortailUsagerAuthLoginForm): Observable<any> {
    return this.http
      .post<PortailUsagerAuthLoginForm>(`${END_POINT_AUTH}/login`, loginForm)
      .pipe();
  }

  public isAuth(): Observable<boolean> {
    if (this.getToken()) {
      return of(false);
    }

    return this.http
      .get<PortailUsagerAuthApiResponse>(`${END_POINT_AUTH}/me`)
      .pipe(
        map((apiAuthResponse: PortailUsagerAuthApiResponse) => {
          // SAVE USER
          this.saveAuthUsager(apiAuthResponse);
          return true;
        }),
        catchError(() => {
          // DELETE USER

          return of(false);
        })
      );
  }

  public get currentUserValue(): PortailUsagerProfile | null {
    return this.currentUsagerSubject.value || null;
  }

  public logout() {
    Sentry.configureScope((scope) => {
      scope.setTag("profil-usager", "none");
      scope.setUser({});
    });

    this.router.navigate(["/connexion"]).then(() => {
      window.location.reload();
    });
  }

  public logoutAndRedirect(state?: RouterStateSnapshot) {
    this.logout();
    if (state) {
      this.router.navigate(["/connexion"], {
        queryParams: { returnUrl: state.url },
      });
    } else {
      this.router.navigate(["/connexion"]);
    }
  }

  public notAuthorized() {
    this.toastr.error(
      "Vous n'êtes pas autorisé à accéder à cette page",
      "Action interdite"
    );
    this.router.navigate(["/"]);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveAuthUsager(apiAuthResponse: PortailUsagerAuthApiResponse): void {
    // Build usager
    const authUsagerProfile = apiAuthResponse.profile;
    // Enregistrement du token
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, apiAuthResponse.token);
    // Enregistrement de l'utilisateur
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(authUsagerProfile));

    // Sentry
    Sentry.configureScope((scope) => {
      scope.setTag("auth-usager-ref", authUsagerProfile.toString());
      scope.setUser({
        username:
          "AuthUsager " +
          authUsagerProfile.usager.ref.toString() +
          " : " +
          authUsagerProfile.usager.prenom,
      });
    });

    // Mise à jour de l'observable
    this.currentUsagerSubject.next(authUsagerProfile);
  }
}
