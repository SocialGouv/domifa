import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import * as Sentry from "@sentry/browser";
import jwtDecode from "jwt-decode";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UserStructure } from "../../../../_common/model";
import { usagersCache } from "../../../shared/store";
import { userStructureBuilder } from "../../users/services";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<UserStructure>;

  private endPoint = environment.apiUrl + "structures/auth";

  constructor(
    public http: HttpClient,
    private toastr: ToastrService,
    public router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<UserStructure | null>(
      JSON.parse(localStorage.getItem("currentUser") || null)
    );
  }

  public get currentUserValue(): UserStructure | null {
    return this.currentUserSubject.value;
  }

  public login(email: string, password: string): Observable<any> {
    usagersCache.clearCache();
    return this.http
      .post<any>(`${this.endPoint}/login`, {
        email,
        password,
      })
      .pipe(
        map((token: { access_token: string }) => {
          const user = userStructureBuilder.buildUserStructure(
            jwtDecode(token.access_token)
          );
          user.access_token = token.access_token;

          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.removeItem("filters");

          this.currentUserSubject.next(user);

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
        user.access_token = this.currentUserValue.access_token;

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
        return true;
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem("currentUser");
        return of(false);
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
    usagersCache.clearCache();
    this.currentUserSubject.next(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("filters");
    // Ajout d'infos pour Sentry
    Sentry.configureScope((scope) => {
      scope.setTag("structure", "none");
      scope.setUser({});
    });

    this.router.navigate(["/connexion"]).then(() => {
      window.location.reload();
    });
  }

  public logoutAndRedirect(state?: RouterStateSnapshot) {
    this.logout();
    if (state) {
      this.router.navigate(["/connexion"], {
        queryParams: { returnUrl: state.url },
      });
    } else {
      this.router.navigate(["/connexion"]);
    }
  }

  public notAuthorized() {
    this.toastr.error(
      "Vous n'êtes pas autorisé à accéder à cette page",
      "Action interdite"
    );
    this.router.navigate(["/"]);
  }
}
