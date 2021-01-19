import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

import * as Sentry from "@sentry/browser";
import jwtDecode from "jwt-decode";

import { environment } from "src/environments/environment";
import { AppUser } from "../../../../_common/model";
import { appUserBuilder } from "../../users/services";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<AppUser>;

  private endPoint = environment.apiUrl + "auth";

  constructor(public http: HttpClient, public router: Router) {
    this.http = http;
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(
      JSON.parse(localStorage.getItem("currentUser") || null)
    );
  }

  public get currentUserValue(): AppUser | null {
    return this.currentUserSubject.value;
  }

  public login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.endPoint}/login`, {
        email,
        password,
      })
      .pipe(
        map((token) => {
          const user = appUserBuilder.buildAppUser(
            jwtDecode(token.access_token)
          );
          user.temporaryTokens = token.access_token;

          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.removeItem("filters");

          this.currentUserSubject.next(user);

          return user;
        })
      );
  }

  public me(): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.endPoint}/me`).pipe(
      map((apiUser: AppUser) => {
        const user = appUserBuilder.buildAppUser(apiUser);
        user.temporaryTokens = this.currentUserValue.temporaryTokens;

        localStorage.setItem("currentUser", JSON.stringify(user));

        // Ajout d'infos pour Sentry
        Sentry.configureScope((scope) => {
          scope.setTag("structure", user.structureId.toString());
          scope.setUser({
            email: user.email,
            username:
              "STRUCTURE " + user.structureId.toString() + " : " + user.prenom,
          });
        });
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  public isDomifa(): Observable<boolean> {
    return this.http.get<any>(`${this.endPoint}/domifa`).pipe(
      map(() => {
        return true;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  public logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("filters");
    this.currentUserSubject.next(null);

    // Ajout d'infos pour Sentry
    Sentry.configureScope((scope) => {
      scope.setTag("structure", "none");
      scope.setUser({});
    });
  }

  public logoutAndRedirect(url?: string): void {
    this.logout();

    if (url) {
      this.router.navigate(["/connexion"], {
        queryParams: { returnUrl: url },
      });
    } else {
      this.router.navigate(["/connexion"]);
    }
  }
}
