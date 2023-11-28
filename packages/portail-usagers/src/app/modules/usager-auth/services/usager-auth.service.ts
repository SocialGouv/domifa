import { CustomToastService } from "./../../shared/services/custom-toast.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";

import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../../environments/environment";
import { PortailUsagerAuthLoginForm } from "../../../../_common";
import { configureScope } from "@sentry/angular";
import { globalConstants } from "../../../shared";
import {
  PortailUsagerProfile,
  PortailUsagerAuthApiResponse,
} from "@domifa/common";

const END_POINT_AUTH = environment.apiUrl + "portail-usagers/auth";
const END_POINT_PROFILE = environment.apiUrl + "portail-usagers/profile";

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
    private readonly toastr: CustomToastService,
  ) {
    this.currentUsagerSubject =
      new BehaviorSubject<PortailUsagerProfile | null>(null);
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
        this.saveAuthUsager(portailUsagerProfile);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  public get currentUserValue(): PortailUsagerProfile | null {
    return this.currentUsagerSubject.value ?? null;
  }

  public logout(): void {
    this.currentUsagerSubject.next(null);
    globalConstants.clearStorage();

    configureScope((scope) => {
      scope.setTag("profil-usager", "none");
      scope.setUser({});
    });
  }

  public logoutAndRedirect(state?: RouterStateSnapshot): void {
    this.logout();

    this.router
      .navigate(["/auth/login"], {
        queryParams: state ? { returnUrl: state.url } : {},
      })
      .then(() => {
        window.location.reload();
      });
  }

  public notAuthorized(): void {
    this.toastr.error("Vous n'êtes pas autorisé à accéder à cette page");
    this.router.navigate(["/"]);
  }

  public getToken(): string | null {
    return globalConstants.getItem(TOKEN_KEY);
  }

  public saveToken(apiAuthResponse: PortailUsagerAuthApiResponse): void {
    // Enregistrement du token
    globalConstants.removeItem(TOKEN_KEY);
    globalConstants.setItem(TOKEN_KEY, apiAuthResponse.token);

    // Build usager
    this.saveAuthUsager(apiAuthResponse.profile);
  }

  public acceptTerms(): Observable<PortailUsagerAuthApiResponse> {
    return this.http.get<PortailUsagerAuthApiResponse>(
      `${END_POINT_AUTH}/accept-terms`,
    );
  }

  public saveAuthUsager(authUsagerProfile: PortailUsagerProfile): void {
    // Enregistrement de l'utilisateur
    globalConstants.removeItem(USER_KEY);
    globalConstants.setItem(USER_KEY, JSON.stringify(authUsagerProfile));

    // Sentry
    configureScope((scope) => {
      scope.setUser({
        username:
          "AuthUsager " +
          authUsagerProfile.usager.customRef.toString() +
          " : " +
          authUsagerProfile.usager.prenom,
      });
    });

    // Mise à jour de l'observable
    this.currentUsagerSubject.next(authUsagerProfile);
  }
}
