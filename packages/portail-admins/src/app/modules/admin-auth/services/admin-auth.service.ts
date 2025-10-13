import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";

import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
} from "rxjs";
import { environment } from "../../../../environments/environment";

import { CustomToastService } from "../../shared/services/custom-toast.service";
import { appStore } from "../../shared/store/appStore.service";
import { PortailAdminAuthLoginForm } from "../types";
import { getCurrentScope } from "@sentry/angular";
import {
  PortailAdminAuthApiResponse,
  PortailAdminUser,
  filterMatomoParams,
} from "@domifa/common";

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
        this.logout();
        return of(false);
      })
    );
  }

  public get currentUserValue(): PortailAdminUser | null {
    return this.currentAdminSubject?.value ?? null;
  }

  public logout(sessionExpired?: boolean): void {
    if (sessionExpired) {
      this.toastr.warning("Votre session a expiré, merci de vous reconnecter");
    }
    appStore.dispatch({ type: "reset" });
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    this.currentAdminSubject.next(null);

    getCurrentScope().setTag("profil-admin", "none");
    getCurrentScope().setUser({});
  }

  public logoutAndRedirect(
    state?: RouterStateSnapshot,
    sessionExpired?: boolean
  ): void {
    this.logout(sessionExpired);

    const cleanPath = state?.url?.split("?")[0] || "/";
    const matomoParams = this.getMatomoParams();

    const queryParams: Record<string, string> = { ...matomoParams };

    if (cleanPath !== "/" && cleanPath !== "/auth/login") {
      queryParams.redirectToAfterLogin = cleanPath;
    }

    this.router.navigate(["/auth/login"], { queryParams });
  }

  private getMatomoParams(): Record<string, string> {
    try {
      const urlTree = this.router.parseUrl(this.router.url);
      return filterMatomoParams(urlTree.queryParams);
    } catch (error) {
      console.warn("Failed to parse URL for Matomo params:", error);
      return {};
    }
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

    this.saveAuthAdmin(apiAuthResponse.user);
  }

  public saveAuthAdmin(authAdminProfile: PortailAdminUser): void {
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

    this.currentAdminSubject.next(authAdminProfile);
  }

  public logoutFromBackend = async (
    state?: RouterStateSnapshot,
    sessionExpired?: boolean
  ) => {
    const storedUser = window.sessionStorage.getItem(USER_KEY);
    if (storedUser) {
      await firstValueFrom(this.http.get(`${END_POINT_AUTH}/logout`));
    }
    this.logoutAndRedirect(state, sessionExpired);
  };
}
