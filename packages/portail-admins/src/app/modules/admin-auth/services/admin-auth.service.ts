import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { configureScope } from "@sentry/angular";

import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  PortailAdminAuthApiResponse,
  PortailAdminProfile,
} from "../../../../_common";
import { CustomToastService } from "../../shared/services/custom-toast.service";
import { appStore } from "../../shared/store/appStore.service";
import { PortailAdminAuthLoginForm } from "../model";

const END_POINT_AUTH = environment.apiUrl + "portail-admins/auth";
const END_POINT_PROFILE = environment.apiUrl + "portail-admins/profile";

const TOKEN_KEY = "admin-auth-token";
const USER_KEY = "admin-auth-datas";

@Injectable({
  providedIn: "root",
})
export class AdminAuthService {
  public currentAdminSubject: BehaviorSubject<PortailAdminProfile | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toastr: CustomToastService
  ) {
    this.currentAdminSubject = new BehaviorSubject<PortailAdminProfile | null>(
      null
    );
  }

  public login(
    loginForm: PortailAdminAuthLoginForm
  ): Observable<PortailAdminAuthApiResponse> {
    return this.http.post<PortailAdminAuthApiResponse>(
      `${END_POINT_AUTH}/login`,
      loginForm
    );
  }

  public isAuth(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.http.get<PortailAdminProfile>(`${END_POINT_PROFILE}/me`).pipe(
      map((portailAdminProfile: PortailAdminProfile) => {
        // SAVE USER
        this.saveAuthAdmin(portailAdminProfile);
        return true;
      }),
      catchError(() => {
        // DELETE USER
        this.logout();
        return of(false);
      })
    );
  }

  public get currentUserValue(): PortailAdminProfile | null {
    return this.currentAdminSubject?.value ?? null;
  }

  public logout(): void {
    appStore.dispatch({ type: "reset" });
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    this.currentAdminSubject.next(null);
    configureScope((scope) => {
      scope.setTag("profil-admin", "none");
      scope.setUser({});
    });
  }

  public logoutAndRedirect({
    redirectToAfterLogin,
  }: {
    redirectToAfterLogin?: string;
  } = {}): void {
    this.logout();
    this.router.navigate(["/auth/login"], {
      queryParams: {
        redirectToAfterLogin,
      },
    });
  }

  public notAuthorized(): void {
    this.toastr.error("Vous n'êtes pas autorisé à accéder à cette page");
    this.router.navigate(["/"]);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveToken(apiAuthResponse: PortailAdminAuthApiResponse): void {
    // Enregistrement du token
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, apiAuthResponse.token);

    // Build admin
    this.saveAuthAdmin(apiAuthResponse.profile);
  }

  public saveAuthAdmin(authAdminProfile: PortailAdminProfile): void {
    // Enregistrement de l'utilisateur
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(authAdminProfile));

    // Sentry
    configureScope((scope) => {
      scope.setTag("auth-admin-ref", JSON.stringify(authAdminProfile));
      scope.setUser({
        username:
          "AuthAdmin " +
          authAdminProfile.user.id.toString() +
          " : " +
          authAdminProfile.user.prenom,
      });
    });

    // Mise à jour de l'observable
    this.currentAdminSubject.next(authAdminProfile);
  }
}
