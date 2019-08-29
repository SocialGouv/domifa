import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "../modules/users/interfaces/user";
import jwtDecode from "jwt-decode";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public http: HttpClient;
  public currentUser: Observable<User>;
  private endPoint = environment.apiUrl + "auth";
  private currentUserSubject: BehaviorSubject<User>;

  constructor(http: HttpClient) {
    this.http = http;
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
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
          user.token = token.access_token;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  public isAuth(token: string) {
    return this.http.get<any>(`${this.endPoint}/me`);
  }
  public logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }
}
