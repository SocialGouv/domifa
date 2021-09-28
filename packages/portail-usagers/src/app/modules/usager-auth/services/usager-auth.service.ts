import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, of, map, catchError } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AuthApiResponse } from "../../../../_common/auth/AuthApiResponse.type";
import { AuthLoginForm } from "../../../../_common/auth/AuthLoginForm.type";
import { DEFAULT_USAGER } from "../../../../_common/mocks/DEFAULT_USAGER.const";
import { UsagerPublic } from "../../../../_common/usager";
import * as Sentry from "@sentry/browser";

const END_POINT_AUTH = environment.apiUrl + "usager-auth";

const TOKEN_KEY = "usager-auth-token";
const USER_KEY = "usager-auth-datas";

@Injectable({
  providedIn: "root",
})
export class UsagerAuthService {
  public currentUsagerSubject: BehaviorSubject<UsagerPublic | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {
    this.currentUsagerSubject = new BehaviorSubject<UsagerPublic | null>(
      DEFAULT_USAGER
    );
  }

  public login(loginForm: AuthLoginForm): Observable<any> {
    return this.http
      .post<AuthLoginForm>(`${END_POINT_AUTH}/login`, loginForm)
      .pipe();
  }

  public isAuth(): Observable<boolean> {
    if (this.getToken()) {
      return of(false);
    }

    return this.http.get<AuthApiResponse>(`${END_POINT_AUTH}/me`).pipe(
      map((apiAuthResponse: AuthApiResponse) => {
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

  public get currentUserValue(): UsagerPublic | null {
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

  public saveAuthUsager(apiAuthResponse: AuthApiResponse): void {
    // Build usager
    const authUsager = apiAuthResponse.authUsager;
    // Enregistrement du token
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, apiAuthResponse.token);
    // Enregistrement de l'utilisateur
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(
      USER_KEY,
      JSON.stringify(apiAuthResponse.authUsager)
    );

    // Sentry
    Sentry.configureScope((scope) => {
      scope.setTag("auth-usager-ref", authUsager.toString());
      scope.setUser({
        username:
          "AuthUsager " + authUsager.ref.toString() + " : " + authUsager.prenom,
      });
    });

    // Mise à jour de l'observable
    this.currentUsagerSubject.next(authUsager);
  }
}
