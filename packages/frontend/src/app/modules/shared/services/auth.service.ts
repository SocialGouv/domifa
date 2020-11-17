import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Sentry from "@sentry/browser";
import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AppUser } from "../../../../_common/model";
import { appUserBuilder } from "../../users/services";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public isAdmin: boolean;

  public currentUser: Observable<AppUser>;
  public currentUserSubject: BehaviorSubject<AppUser>;

  private endPoint = environment.apiUrl + "auth";

  constructor(public http: HttpClient) {
    this.http = http;
    this.isAdmin = false;

    this.currentUserSubject = new BehaviorSubject<AppUser | null>(
      JSON.parse(localStorage.getItem("currentUser") || null)
    );

    this.currentUser = this.currentUserSubject.asObservable();
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

          this.isAdmin = user && user.role === "admin";

          user.temporaryTokens = token.access_token;

          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.removeItem("filters");

          this.currentUserSubject.next(user);

          return user;
        })
      );
  }

  public me(): Observable<any> {
    return this.http.get<AppUser>(`${this.endPoint}/me`).pipe(
      map((retour: any) => {
        if (Object.keys(retour).length === 0) {
          return false;
        }

        const user = appUserBuilder.buildAppUser(retour);

        user.temporaryTokens = this.currentUserValue.temporaryTokens;
        this.isAdmin = user && user.role === "admin";

        this.currentUserSubject.next(user);
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

        return true;
      }),
      catchError((err) => {
        return of(false);
      })
    );
  }

  public isDomifa(): Observable<any> {
    return this.http.get<any>(`${this.endPoint}/domifa`);
  }

  public isAuth(): Observable<boolean> {
    if (!this.currentUserValue) {
      return of(false);
    }

    return this.me().pipe(
      map((retour: any) => {
        if (Object.keys(retour).length === 0) {
          this.logout();
          return false;
        }

        const user = appUserBuilder.buildAppUser(retour);

        user.temporaryTokens = this.currentUserValue.temporaryTokens;
        this.isAdmin = user && user.role === "admin";

        this.currentUserSubject.next(user);
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
        return true;
      }),
      catchError((err) => {
        return of(false);
      })
    );
  }

  public logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("filters");

    this.currentUserSubject.next(null);

    this.isAdmin = false;

    // Ajout d'infos pour Sentry
    Sentry.configureScope((scope) => {
      scope.setTag("structure", "none");
      scope.setUser({});
    });
  }
}
