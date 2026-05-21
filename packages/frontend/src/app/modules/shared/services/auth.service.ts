import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, Observable, firstValueFrom, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

import { usagerActions, UsagerState } from "../../../shared";
import { userStructureBuilder } from "../../users/services";
import { CustomToastService } from "./custom-toast.service";
import { getCurrentScope } from "@sentry/angular";
import { UserStructure, filterMatomoParams } from "@domifa/common";
import { Store } from "@ngrx/store";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<UserStructure | null>;
  private readonly endPoint = environment.apiUrl + "structures/auth";

  constructor(
    private readonly http: HttpClient,
    private readonly toastr: CustomToastService,
    private readonly router: Router,
    private readonly store: Store<UsagerState>
  ) {
    const dataStorage = localStorage.getItem("currentUser");
    this.currentUserSubject = new BehaviorSubject<UserStructure | null>(
      dataStorage ? JSON.parse(dataStorage) : null
    );
  }

  public get currentUserValue(): UserStructure | null {
    return this.currentUserSubject.value;
  }

  public acceptTerms(): Observable<UserStructure> {
    return this.http.get<UserStructure>(
      `${environment.apiUrl}users/accept-terms`
    );
  }

  public login(email: string, password: string): Observable<UserStructure> {
    // Re-present the trust token nested in the previous access JWT (if any).
    // When the backend accepts it the OTP step is skipped; otherwise the
    // OtpInterceptor catches the 401 OTP_REQUIRED and re-runs the request
    // with the Otp-Code header automatically.
    const trustToken = this.readTrustTokenFromPreviousAccessToken();

    return this.http
      .post<{ access_token: string }>(`${this.endPoint}/login`, {
        email,
        password,
        ...(trustToken ? { trustToken } : {}),
      })
      .pipe(
        map((token: { access_token: string }) => {
          const user = userStructureBuilder.buildUserStructure(
            jwtDecode(token.access_token)
          );

          user.access_token = token.access_token;
          this.store.dispatch(usagerActions.clearCache());
          this.setUser(user);
          return user;
        })
      );
  }

  // The trust token is a nested signed JWT carried inside the access JWT
  // payload (claim `trustToken`). We decode the previous access JWT without
  // verifying anything — the backend re-verifies signature + binding before
  // trusting the token. If anything is off (missing, malformed, no prior
  // login), return null and the backend falls back to the OTP path.
  private readTrustTokenFromPreviousAccessToken(): string | null {
    const previous = this.currentUserValue?.access_token;
    if (!previous) {
      return null;
    }
    try {
      const decoded = jwtDecode<{ trustToken?: string }>(previous);
      return typeof decoded?.trustToken === "string"
        ? decoded.trustToken
        : null;
    } catch {
      return null;
    }
  }

  public isAuth(): Observable<boolean> {
    if (localStorage.getItem("currentUser") === null) {
      return of(false);
    }

    return this.http.get<UserStructure>(`${this.endPoint}/me`).pipe(
      map((apiUser: UserStructure) => {
        const user = userStructureBuilder.buildUserStructure(apiUser);
        user.access_token = this.currentUserValue?.access_token;
        this.setUser(user);
        return true;
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }

  public logoutFromBackend = async (
    state?: RouterStateSnapshot,
    sessionExpired?: boolean
  ) => {
    if (this.currentUserValue?.access_token) {
      await firstValueFrom(this.http.get(`${this.endPoint}/logout`));
    }
    await this.logout(state, sessionExpired);
  };

  public async logout(
    state?: RouterStateSnapshot,
    sessionExpired?: boolean
  ): Promise<void> {
    this.currentUserSubject.next(null);
    this.store.dispatch(usagerActions.clearCache());
    localStorage.removeItem("currentUser");
    localStorage.removeItem("MANAGE");

    getCurrentScope().setTag("structure", "none");
    getCurrentScope().setUser({});

    if (sessionExpired) {
      this.toastr.warning("Votre session a expiré, merci de vous reconnecter");
    }

    // Navigation avec query params si nécessaire
    if (state?.url) {
      const cleanPath = state.url.split("?")[0];
      const matomoParams = this.getMatomoParams();
      const queryParams: Record<string, string> = { ...matomoParams };

      if (cleanPath !== "/") {
        queryParams.returnUrl = cleanPath;
      }

      this.router.navigate(["/connexion"], { queryParams });
    } else {
      this.router.navigate(["/connexion"]);
    }
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

  private setUser(user: UserStructure) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.currentUserSubject.next(user);

    // Configuration Sentry centralisée ici
    getCurrentScope().setTag("structure", user.structureId?.toString());
    getCurrentScope().setUser({
      email: user.email,
      username: `STRUCTURE ${user.structureId?.toString()}`,
    });
  }
}
