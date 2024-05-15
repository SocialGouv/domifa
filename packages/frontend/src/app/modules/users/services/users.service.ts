import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerLight,
  UserStructureEditProfile,
  UserStructureProfile,
} from "../../../../_common/model";
import { userStructureBuilder } from "./userStructureBuilder.service";

import { UserStructure, ApiMessage, UserStructureRole } from "@domifa/common";

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

  public patch(userInfos: UserStructureEditProfile): Observable<UserStructure> {
    return this.http.patch(`${this.endPoint}`, userInfos).pipe(
      map((response) => {
        return userStructureBuilder.buildUserStructure(response);
      })
    );
  }

  public getUsers(): Observable<UserStructureProfile[]> {
    return this.http.get<UserStructureProfile[]>(`${this.endPoint}`);
  }

  public updateRole(
    uuid: string,
    role: UserStructureRole
  ): Observable<UserStructureProfile> {
    return this.http.patch<UserStructureProfile>(
      `${this.endPoint}/update-role/${uuid}`,
      {
        role,
      }
    );
  }

  public deleteUser(uuid: string): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.endPoint}/${uuid}`);
  }

  public getPasswordToken(data: string) {
    return this.http.post(`${this.endPoint}/get-password-token`, data);
  }

  public getLastPasswordUpdate(): Observable<Date | null> {
    return this.http.get<Date | null>(`${this.endPoint}/last-password-update`);
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

  public updateMyPassword(data: {
    passwordConfirmation: string;
    password: string;
    oldPassword: string;
  }): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.endPoint}/edit-my-password`,
      data
    );
  }

  public registerUser(data: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.endPoint}/register`, data);
  }

  public agenda(): Observable<UsagerLight[]> {
    return this.http.get<UsagerLight[]>(`${environment.apiUrl}agenda`);
  }
}
