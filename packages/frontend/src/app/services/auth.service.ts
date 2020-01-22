import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "../modules/users/interfaces/user";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public isLogged: boolean;
  public isAdmin: boolean;

  public http: HttpClient;
  public currentUser: Observable<User>;

  private endPoint = environment.apiUrl + "auth";
  private currentUserSubject: BehaviorSubject<User>;

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  constructor(http: HttpClient) {
    this.http = http;
    this.isLogged = false;
    this.isAdmin = false;

    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem("currentUser") || "{}")
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.endPoint}/login`, {
        email,
        password
      })
      .pipe(
        map(token => {
          const user = new User(jwtDecode(token.access_token));

          this.isLogged = true;
          this.isAdmin = user && user.role === "admin";

          user.token = token.access_token;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  public isAuth(): Observable<boolean> {
    if (!this.currentUserValue) {
      return of(false);
    } else {
      return this.http.get<any>(`${this.endPoint}/me`).pipe(
        map(retour => {
          const user = new User(retour);
          user.token = this.currentUserValue.token;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.isLogged = true;
          this.isAdmin = user && user.role === "admin";
          this.currentUserSubject.next(user);
          return true;
        })
      );
    }
  }

  public logout() {
    this.currentUserSubject = new BehaviorSubject(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("filters");
    this.isLogged = false;
    this.isAdmin = false;
  }
}
