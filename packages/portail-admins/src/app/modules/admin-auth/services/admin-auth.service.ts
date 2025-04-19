import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../../environments/environment";

import { CustomToastService } from "../../shared/services/custom-toast.service";
import { appStore } from "../../shared/store/appStore.service";
import { PortailAdminAuthLoginForm } from "../model";
import { getCurrentScope } from "@sentry/angular";
import { PortailAdminAuthApiResponse, PortailAdminUser } from "@domifa/common";

const END_POINT_AUTH = environment.apiUrl + "portail-admins/auth";

const TOKEN_KEY = "admin-auth-token";
const USER_KEY = "admin-auth-datas";

@Injectable({
  providedIn: "root",
})
export class AdminAuthService {
  public currentAdminSubject: BehaviorSubject<PortailAdminUser | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toastr: CustomToastService
  ) {
    const storedUser = window.sessionStorage.getItem(USER_KEY);
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentAdminSubject = new BehaviorSubject<PortailAdminUser | null>(
      initialUser
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

    return this.http.get<PortailAdminUser>(`${END_POINT_AUTH}/me`).pipe(
      map((portailAdminProfile: PortailAdminUser) => {
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

  public get currentUserValue(): PortailAdminUser | null {
    return this.currentAdminSubject?.value ?? null;
  }

  public logout(): void {
    appStore.dispatch({ type: "reset" });
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    this.currentAdminSubject.next(null);

    getCurrentScope().setTag("profil-admin", "none");
    getCurrentScope().setUser({});
  }

  public logoutAndRedirect(): void {
    this.logout();
    this.router.navigate(["/auth/login"]);
  }

  public notAuthorized(): void {
    this.toastr.error("Vous n'êtes pas autorisé à accéder à cette page");
    this.router.navigate(["/"]);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveToken(apiAuthResponse: PortailAdminAuthApiResponse): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, apiAuthResponse.token);

    // Build admin
    this.saveAuthAdmin(apiAuthResponse.user);
  }

  public saveAuthAdmin(authAdminProfile: PortailAdminUser): void {
    // Enregistrement de l'utilisateur
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(authAdminProfile));

    getCurrentScope().setTag(
      "auth-admin-ref",
      JSON.stringify(authAdminProfile)
    );
    getCurrentScope().setUser({
      username:
        "AuthAdmin " +
        authAdminProfile.id.toString() +
        " : " +
        authAdminProfile.prenom,
    });

    // Mise à jour de l'observable
    this.currentAdminSubject.next(authAdminProfile);
  }
}
