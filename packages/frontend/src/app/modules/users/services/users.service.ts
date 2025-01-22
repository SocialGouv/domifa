import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiMessage } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private endPoint = environment.apiUrl + "users";

  constructor(private readonly http: HttpClient) {}

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.endPoint}/validate-email`, {
      email,
    });
  }

  public getPasswordToken(data: string) {
    return this.http.post(`${this.endPoint}/get-password-token`, data);
  }

  public checkPasswordToken({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }) {
    return this.http.get(
      `${this.endPoint}/check-password-token/${userId}/${token}`
    );
  }

  public resetPassword(data: {
    passwordConfirmation: string;
    password: string;
    token: string;
    userId: number;
  }) {
    return this.http.post(`${this.endPoint}/reset-password`, data);
  }

  public registerUser(data: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.endPoint}/register`, data);
  }
}
