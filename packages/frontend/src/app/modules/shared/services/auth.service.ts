import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import { configureScope } from "@sentry/angular";

import { UserIdleService } from "angular-user-idle";
import jwtDecode from "jwt-decode";

import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { UserStructure } from "../../../../_common/model";
import { usagersCache } from "../../../shared";
import { userStructureBuilder } from "../../users/services";
import { CustomToastService } from "./custom-toast.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<UserStructure | null>;

  private endPoint = environment.apiUrl + "structures/auth";

  constructor(
    private readonly http: HttpClient,
    private readonly toastr: CustomToastService,
    private readonly router: Router,
    private readonly userIdleService: UserIdleService
  ) {
    this.currentUserSubject = new BehaviorSubject<UserStructure | null>(
      localStorage.getItem("currentUser") !== null
        ? JSON.parse(localStorage.getItem("currentUser") as string)
        : null
    );
  }

  public get currentUserValue(): UserStructure | null {
    return this.currentUserSubject.value;
  }

  public login(email: string, password: string): Observable<UserStructure> {
    return this.http
      .post<{ access_token: string }>(`${this.endPoint}/login`, {
        email,
        password,
      })
      .pipe(
        map((token: { access_token: string }) => {
          const user = userStructureBuilder.buildUserStructure(
            jwtDecode(token.access_token)
          );
          user.access_token = token.access_token;
          this.setUser(user);
          return user;
        })
      );
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

  public isDomifa(): Observable<boolean> {
    return this.http.get<boolean>(`${this.endPoint}/domifa`).pipe(
      map(() => {
        return true;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  public logout(): void {
    this.currentUserSubject.next(null);
    usagersCache.clearCache();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("filters");
    // Ajout d'infos pour Sentry
    configureScope((scope) => {
      scope.setTag("structure", "none");
      scope.setUser({});
    });
    this.userIdleService.stopWatching();
    this.router.navigate(["/connexion"]);
  }

  public logoutAndRedirect(
    state?: RouterStateSnapshot,
    sessionExpired?: true
  ): void {
    if (sessionExpired) {
      this.toastr.warning("Votre session a expiré, merci de vous reconnecter");
    }
    this.logout();
    if (state) {
      this.router.navigate(["/connexion"], {
        queryParams: { returnUrl: state.url },
      });
    } else {
      this.router.navigate(["/connexion"]);
    }
  }

  public notAuthorized(): void {
    this.toastr.error(
      "Action interdite : vous n'êtes pas autorisé à accéder à cette page"
    );
    this.router.navigate(["/"]);
  }

  private setUser(user: UserStructure) {
    usagersCache.clearCache();
    localStorage.removeItem("filters");
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.userIdleService.startWatching();

    // Ajout d'infos pour Sentry
    configureScope((scope) => {
      scope.setTag("structure", user.structureId?.toString());
      scope.setUser({
        email: user.email,
        username:
          "STRUCTURE " + user.structureId?.toString() + " : " + user.prenom,
      });
    });
  }
}
