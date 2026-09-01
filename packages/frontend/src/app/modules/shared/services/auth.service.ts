import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, Observable, firstValueFrom, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

import { usagerActions, UsagerState } from "../../../shared";
import { userStructureBuilder } from "../../users/services";
import { CustomToastService } from "./custom-toast.service";
import { SafeStorageService } from "./safe-storage.service";
import { getCurrentScope } from "@sentry/angular";
import { UserStructure, filterMatomoParams } from "@domifa/common";
import { Store } from "@ngrx/store";

// Persisted separately from `currentUser` so it survives logout. The trust
// token represents "this device is trusted" — clearing it on logout would force
// an OTP cycle on every reconnection. It is rotated on every backend response
// that issues a new access JWT. Also mirrored server-side in an httpOnly
// cookie so browsers that wipe localStorage (private mode, cleanup extensions)
// still get a trusted-device pass on the next login. Never used for the
// dedicated "support" account — see persistTrustTokenFromAccess.
const TRUST_TOKEN_STORAGE_KEY = "structureTrustToken";

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
    private readonly store: Store<UsagerState>,
    private readonly safeStorage: SafeStorageService
  ) {
    // The dedicated "support" account's session lives in sessionStorage
    // (dies with the tab); every other role uses localStorage. Check
    // sessionStorage first since it's the narrower, more specific case.
    const dataStorage =
      this.safeStorage.getItem("currentUser", sessionStorage) ??
      this.safeStorage.getItem("currentUser");
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
    // Re-present the persisted trust token. Backend verifies signature + IP/UA
    // binding and either skips the OTP step (trusted device) or falls back to
    // the OTP cycle via OtpInterceptor + 401 OTP_REQUIRED.
    const trustToken = this.readTrustToken();

    return this.http
      .post<{ access_token: string }>(
        `${this.endPoint}/login`,
        {
          email: email.trim().toLowerCase(),
          password,
          ...(trustToken ? { trustToken } : {}),
        },
        // Required so the browser (a) receives the Set-Cookie for the
        // httpOnly trust cookie backup, and (b) re-sends it on subsequent
        // logins when localStorage has been wiped.
        { withCredentials: true }
      )
      .pipe(
        switchMap((token: { access_token: string }) => {
          const user = userStructureBuilder.buildUserStructure(
            jwtDecode(token.access_token)
          );
          user.access_token = token.access_token;

          if (user.role === "support") {
            // The JWT's own structureId is a never-trusted placeholder for
            // this account — the real, current structure only comes from
            // GET /me, which resolves it from the active attachment. No
            // trust token either: a shared account never "remembers" a
            // device.
            this.store.dispatch(usagerActions.clearCache());
            this.setUser(user);
            return this.http.get<UserStructure>(`${this.endPoint}/me`).pipe(
              map((apiUser: UserStructure) => {
                const refreshed =
                  userStructureBuilder.buildUserStructure(apiUser);
                refreshed.access_token = token.access_token;
                this.setUser(refreshed);
                return refreshed;
              })
            );
          }

          this.persistTrustTokenFromAccess(token.access_token);
          this.store.dispatch(usagerActions.clearCache());
          this.setUser(user);
          return of(user);
        })
      );
  }

  // Persists the trust token from a freshly-issued access JWT. The backend
  // rotates the trust token on every login (OTP path AND trusted path), so we
  // always overwrite the stored value with the latest one. Stored in its own
  // localStorage key so logout doesn't wipe it.
  private persistTrustTokenFromAccess(accessToken: string): void {
    try {
      const decoded = jwtDecode<{ trustToken?: string }>(accessToken);
      if (typeof decoded?.trustToken === "string") {
        this.safeStorage.setItem(TRUST_TOKEN_STORAGE_KEY, decoded.trustToken);
      }
    } catch {
      /* malformed access token — leave the previous trust token untouched */
    }
  }

  private readTrustToken(): string | null {
    return this.safeStorage.getItem(TRUST_TOKEN_STORAGE_KEY);
  }

  public isAuth(): Observable<boolean> {
    if (
      this.safeStorage.getItem("currentUser", sessionStorage) === null &&
      this.safeStorage.getItem("currentUser") === null
    ) {
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
    // Clear both backends unconditionally — cheap, and avoids having to
    // track which one the current session actually used.
    this.safeStorage.removeItem("currentUser");
    this.safeStorage.removeItem("currentUser", sessionStorage);
    this.safeStorage.removeItem("MANAGE");
    this.safeStorage.removeItem("MANAGE", sessionStorage);

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
    const backend = user.role === "support" ? sessionStorage : localStorage;
    this.safeStorage.setItem("currentUser", JSON.stringify(user), backend);
    this.currentUserSubject.next(user);

    // Configuration Sentry centralisée ici
    getCurrentScope().setTag("structure", user.structureId?.toString());
    getCurrentScope().setUser({
      email: user.email,
      username: `STRUCTURE ${user.structureId?.toString()}`,
    });
  }
}
