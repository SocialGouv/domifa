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
import { PortailUsagerAuthLoginForm } from "../../../../_common";

import {
  PortailUsagerProfile,
  PortailUsagerAuthApiResponse,
  UsagerOptions,
  filterMatomoParams,
} from "@domifa/common";
import { getCurrentScope } from "@sentry/angular";
import { CustomToastService } from "../../shared/services/custom-toast.service";

const END_POINT_AUTH = `${environment.apiUrl}portail-usagers/auth`;
const END_POINT_PROFILE = `${environment.apiUrl}portail-usagers/profile`;

const TOKEN_KEY = "usager-auth-token";
const USER_KEY = "usager-auth-data";

@Injectable({
  providedIn: "root",
})
export class UsagerAuthService {
  public currentUsagerSubject: BehaviorSubject<PortailUsagerProfile | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toastr: CustomToastService
  ) {
    this.currentUsagerSubject =
      new BehaviorSubject<PortailUsagerProfile | null>(null);
  }

  public login(
    loginForm: PortailUsagerAuthLoginForm
  ): Observable<PortailUsagerAuthApiResponse> {
    return this.http.post<PortailUsagerAuthApiResponse>(
      `${END_POINT_AUTH}/login`,
      loginForm
    );
  }

  public isAuth(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.http.get<PortailUsagerProfile>(`${END_POINT_PROFILE}/me`).pipe(
      map((portailUsagerProfile: PortailUsagerProfile) => {
        this.saveAuthUsager(portailUsagerProfile);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  public get currentUserValue(): PortailUsagerProfile | null {
    return this.currentUsagerSubject.value ?? null;
  }

  public logout(sessionExpired?: boolean): void {
    if (sessionExpired) {
      this.toastr.warning("Votre session a expiré, merci de vous reconnecter");
    }
    this.currentUsagerSubject.next(null);
    localStorage.clear();

    getCurrentScope().setTag("profil-usager", "none");
    getCurrentScope().setUser({});
  }

  public logoutAndRedirect(
    state?: RouterStateSnapshot,
    sessionExpired?: boolean
  ): void {
    this.logout(sessionExpired);

    const matomoParams = this.getMatomoParams();
    console.log({ matomoParams });
    const queryParams: Record<string, string> = { ...matomoParams };

    this.router.navigate(["/auth/login"], { queryParams }).then(() => {
      window.location.href = "/auth/login";
    });
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
    const token: string | null = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    return JSON.parse(token);
  }

  public saveToken(apiAuthResponse: PortailUsagerAuthApiResponse): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(apiAuthResponse.token));
    this.saveAuthUsager(apiAuthResponse.profile);
  }

  public acceptTerms(): Observable<PortailUsagerAuthApiResponse> {
    return this.http.get<PortailUsagerAuthApiResponse>(
      `${END_POINT_AUTH}/accept-terms`
    );
  }

  public saveAuthUsager(authUsagerProfile: PortailUsagerProfile): void {
    authUsagerProfile.usager = {
      ...authUsagerProfile.usager,
      options: new UsagerOptions(authUsagerProfile.usager.options),
    };
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(authUsagerProfile));

    getCurrentScope().setUser({
      username:
        "AuthUsager " +
        authUsagerProfile.usager.customRef.toString() +
        " : " +
        authUsagerProfile.usager.prenom,
    });

    this.currentUsagerSubject.next(authUsagerProfile);
  }

  public logoutFromBackend = async (
    state?: RouterStateSnapshot,
    sessionExpired?: boolean
  ) => {
    const storedUser = this.getToken();
    if (storedUser) {
      await firstValueFrom(this.http.get(`${END_POINT_AUTH}/logout`));
    }
    this.logoutAndRedirect(state, sessionExpired);
  };
}
