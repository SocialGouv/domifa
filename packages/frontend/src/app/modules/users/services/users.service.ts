import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiMessage, UserStructure } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private endPoint = environment.apiUrl + "users";

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

  public confirmEmailUpdate({
    uuid,
    token,
  }: {
    uuid: string;
    token: string;
  }): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.endPoint}/confirm-email-update/${uuid}/${token}`,
      {}
    );
  }

  public registerUser(
    data: Pick<
      UserStructure,
      "email" | "nom" | "role" | "prenom" | "structureId"
    >
  ): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.endPoint}/register`, data);
  }
}
