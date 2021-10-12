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

const END_POINT_AUTH = environment.apiUrl + "auth";
const END_POINT_PROFILE = environment.apiUrl + "profile";

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
    private readonly toastr: ToastrService,
  ) {
    this.currentUsagerSubject =
      new BehaviorSubject<PortailUsagerProfile | null>(DEFAULT_USAGER_PROFILE);
  }

  public login(
    loginForm: PortailUsagerAuthLoginForm,
  ): Observable<PortailUsagerAuthApiResponse> {
    return this.http.post<PortailUsagerAuthApiResponse>(
      `${END_POINT_AUTH}/login`,
      loginForm,
    );
  }

  public isAuth(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.http.get<PortailUsagerProfile>(`${END_POINT_PROFILE}/me`).pipe(
      map((portailUsagerProfile: PortailUsagerProfile) => {
        // SAVE USER
        console.info("isAuth Response");
        this.saveAuthUsager(portailUsagerProfile);
        return true;
      }),
      catchError(() => {
        // DELETE USER
        this.logout();
        return of(false);
      }),
    );
  }

  public get currentUserValue(): PortailUsagerProfile | null {
    return this.currentUsagerSubject.value || null;
  }

  public logout(): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    this.currentUsagerSubject.next(null);
    Sentry.configureScope((scope) => {
      scope.setTag("profil-usager", "none");
      scope.setUser({});
    });

    this.router.navigate(["/auth/login"]).then(() => {
      window.location.reload();
    });
  }

  public logoutAndRedirect(state?: RouterStateSnapshot): void {
    this.logout();
    if (state) {
      this.router
        .navigate(["/auth/login"], {
          queryParams: { returnUrl: state.url },
        })
        .then(() => {
          window.location.reload();
        });
    } else {
      this.router.navigate(["/auth/login"]).then(() => {
        window.location.reload();
      });
    }
  }

  public notAuthorized(): void {
    this.toastr.error(
      "Vous n'êtes pas autorisé à accéder à cette page",
      "Action interdite",
    );
    this.router.navigate(["/"]);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveToken(apiAuthResponse: PortailUsagerAuthApiResponse): void {
    // Enregistrement du token
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, apiAuthResponse.token);
    console.log(apiAuthResponse.profile);
    // Build usager
    this.saveAuthUsager(apiAuthResponse.profile);
  }

  public saveAuthUsager(authUsagerProfile: PortailUsagerProfile): void {
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
