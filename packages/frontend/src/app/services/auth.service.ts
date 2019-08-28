import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "auth";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public login(email: string, password: string) {
    return this.http.post<any>(`${this.endPoint}/login`, {
      email,
      password
    });
  }

  public isAuth(token: string, password: string) {
    return this.http.get<any>(`${this.endPoint}/me`);
  }
}
