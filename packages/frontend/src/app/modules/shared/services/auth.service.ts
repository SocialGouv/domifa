import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable, of, empty, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "../../users/interfaces/user";
import * as Sentry from "@sentry/browser";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public isAdmin: boolean;

  public currentUser: Observable<User>;
  public currentUserSubject: BehaviorSubject<User>;

  private endPoint = environment.apiUrl + "auth";

  constructor(public http: HttpClient) {
    this.http = http;
    this.isAdmin = false;

    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem("currentUser") || null)
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
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
          const user = new User(jwtDecode(token.access_token));

          this.isAdmin = user && user.role === "admin";

          user.token = token.access_token;

          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.removeItem("filters");

          this.currentUserSubject.next(user);

          return user;
        })
      );
  }

  public me(): Observable<any> {
    return this.http.get<any>(`${this.endPoint}/me`);
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

        const user = new User(retour);

        user.token = this.currentUserValue.token;
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
