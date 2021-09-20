import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  UsagerLight,
  UserStructure,
  UserStructureEditProfile,
  UserStructureProfile,
  UserStructureRole,
} from "../../../../_common/model";
import { userStructureBuilder } from "./userStructureBuilder.service";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "users";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public getUser(id: number) {
    return this.http.get(`${this.endPoint}/${id}`).pipe(
      map((response) => {
        return userStructureBuilder.buildUserStructure(response);
      })
    );
  }

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post(`${this.endPoint}/validate-email`, { email }).pipe(
      map((response: boolean) => {
        return response;
      })
    );
  }

  public patch(userInfos: UserStructureEditProfile) {
    return this.http.patch(`${this.endPoint}`, userInfos).pipe(
      map((response) => {
        return userStructureBuilder.buildUserStructure(response);
      })
    );
  }

  public getUsers(): Observable<UserStructureProfile[]> {
    return this.http.get(`${this.endPoint}`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) =>
              userStructureBuilder.buildUserStructure(item)
            )
          : [userStructureBuilder.buildUserStructure(response)];
      })
    );
  }

  public getAllUsersForAgenda(): Observable<UserStructure[]> {
    return this.http.get(environment.apiUrl + "agenda/users").pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) =>
              userStructureBuilder.buildUserStructure(item)
            )
          : [userStructureBuilder.buildUserStructure(response)];
      })
    );
  }

  public getNewUsers(): Observable<UserStructureProfile[]> {
    return this.http.get(`${this.endPoint}/to-confirm`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) =>
              userStructureBuilder.buildUserStructure(item)
            )
          : [userStructureBuilder.buildUserStructure(response)];
      })
    );
  }

  public confirmUserFromAdmin(id: number): Observable<UserStructureProfile> {
    return this.http.patch(`${this.endPoint}/confirm/${id}`, {}).pipe(
      map((response) => {
        return userStructureBuilder.buildUserStructure(response);
      })
    );
  }

  public updateRole(
    id: number,
    role: UserStructureRole
  ): Observable<UserStructureProfile> {
    return this.http
      .patch(`${this.endPoint}/update-role/${id}`, {
        role,
      })
      .pipe(
        map((response) => {
          return userStructureBuilder.buildUserStructure(response);
        })
      );
  }

  public deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.endPoint}/${id}`);
  }

  public getPasswordToken(data: string) {
    return this.http.post(`${this.endPoint}/get-password-token`, data);
  }

  public getLastPasswordUpdate() {
    return this.http.get(`${this.endPoint}/last-password-update`);
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

  public resetPassword(data: any) {
    return this.http.post(`${this.endPoint}/reset-password`, data);
  }

  public updatePassword(data: any): Observable<any> {
    return this.http.post(`${this.endPoint}/edit-password`, data);
  }

  public registerUser(data: string) {
    return this.http.post(`${this.endPoint}/register`, data);
  }

  public agenda(): Observable<UsagerLight[] | []> {
    return this.http.get(`${environment.apiUrl}agenda`).pipe(
      map((response) => {
        return Array.isArray(response) ? response : [response];
      })
    );
  }
}
