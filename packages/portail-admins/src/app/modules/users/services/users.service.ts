import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private endPoint = environment.apiUrl + "users-supervisor";

  constructor(private readonly http: HttpClient) {}

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
}
