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
import { PortailStatsAuthLoginForm } from "../types";
import { getCurrentScope } from "@sentry/angular";
import {
  PortailAdminAuthApiResponse,
  PortailAdminUser,
  filterMatomoParams,
} from "@domifa/common";

const END_POINT_AUTH = environment.apiUrl + "portail-admins/auth";

const TOKEN_KEY = "portail-stats-token";
const USER_KEY = "portail-stats-datas";

@Injectable({
  providedIn: "root",
})
export class PortailStatsAuthService {
  public currentUserSubject: BehaviorSubject<PortailAdminUser | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toastr: CustomToastService
  ) {
    const storedUser = window.sessionStorage.getItem(USER_KEY);
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<PortailAdminUser | null>(
      initialUser
    );
  }

  public login(
    loginForm: PortailStatsAuthLoginForm
  ): Observable<PortailAdminAuthApiResponse> {
    return this.http.post<PortailAdminAuthApiResponse>(
      `${END_POINT_AUTH}/login`,
      {
        ...loginForm,
        email: loginForm.email?.trim().toLowerCase(),
      }
    );
  }

  public isAuth(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.http.get<PortailAdminUser>(`${END_POINT_AUTH}/me`).pipe(
      map((userProfile: PortailAdminUser) => {
        this.saveUser(userProfile);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  public get currentUserValue(): PortailAdminUser | null {
    return this.currentUserSubject?.value ?? null;
  }

  public logout(sessionExpired?: boolean): void {
    if (sessionExpired) {
      this.toastr.warning("Votre session a expiré, merci de vous reconnecter");
    }
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.localStorage.clear();
    this.currentUserSubject.next(null);

    getCurrentScope().setTag("profil-portail-stats", "none");
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

    this.saveUser(apiAuthResponse.user);
  }

  public saveUser(userProfile: PortailAdminUser): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(userProfile));

    getCurrentScope().setTag(
      "portail-stats-user-ref",
      JSON.stringify(userProfile)
    );
    getCurrentScope().setUser({
      username:
        "PortailStats " +
        userProfile.id.toString() +
        " : " +
        userProfile.prenom,
    });

    this.currentUserSubject.next(userProfile);
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
