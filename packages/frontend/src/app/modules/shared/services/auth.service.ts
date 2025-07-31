import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable, firstValueFrom, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

import { usagerActions, UsagerState } from "../../../shared";
import { userStructureBuilder } from "../../users/services";
import { CustomToastService } from "./custom-toast.service";
import { getCurrentScope } from "@sentry/angular";
import { UserStructure } from "@domifa/common";
import { Store } from "@ngrx/store";

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
          this.store.dispatch(usagerActions.clearCache());
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

  public logoutFromBackend = async () => {
    if (this.currentUserValue?.access_token) {
      await firstValueFrom(this.http.get(`${this.endPoint}/logout`));
    }
    this.logout();
  };

  public async logout(): Promise<void> {
    this.currentUserSubject.next(null);
    this.store.dispatch(usagerActions.clearCache());
    localStorage.removeItem("currentUser");
    localStorage.removeItem("MANAGE");

    getCurrentScope().setTag("structure", "none");
    getCurrentScope().setUser({});

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

  private setUser(user: UserStructure) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.currentUserSubject.next(user);

    getCurrentScope().setTag("structure", user.structureId?.toString());
    getCurrentScope().setUser({
      email: user.email,
      username:
        "STRUCTURE " + user.structureId?.toString() + " : " + user.prenom,
    });
  }
}
