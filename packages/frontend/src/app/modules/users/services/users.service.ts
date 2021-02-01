import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  AppUser,
  UsagerLight,
  UserProfile,
  UserRole,
} from "../../../../_common/model";
import { appUserBuilder } from "./app-user-builder.service";

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
        return appUserBuilder.buildAppUser(response);
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

  public create(data: any) {
    return this.http.post(`${this.endPoint}`, data);
  }

  public patch(data: any) {
    return this.http.patch(`${this.endPoint}`, data).pipe(
      map((response) => {
        return appUserBuilder.buildAppUser(response);
      })
    );
  }

  public getUsers(): Observable<UserProfile[]> {
    return this.http.get(`${this.endPoint}`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => appUserBuilder.buildAppUser(item))
          : [appUserBuilder.buildAppUser(response)];
      })
    );
  }

  public getUsersMeeting(): Observable<AppUser[]> {
    return this.http.get(environment.apiUrl + "agenda/users").pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => appUserBuilder.buildAppUser(item))
          : [appUserBuilder.buildAppUser(response)];
      })
    );
  }

  public getNewUsers(): Observable<UserProfile[]> {
    return this.http.get(`${this.endPoint}/to-confirm`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => appUserBuilder.buildAppUser(item))
          : [appUserBuilder.buildAppUser(response)];
      })
    );
  }

  public confirmUser(id: number): Observable<UserProfile> {
    return this.http.get(`${this.endPoint}/confirm/${id}`).pipe(
      map((response) => {
        return appUserBuilder.buildAppUser(response);
      })
    );
  }

  public updateRole(id: number, role: UserRole): Observable<UserProfile> {
    return this.http.get(`${this.endPoint}/update-role/${id}/${role}`).pipe(
      map((response) => {
        return appUserBuilder.buildAppUser(response);
      })
    );
  }

  public deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.endPoint}/${id}`);
  }

  public getPasswordToken(data: string) {
    return this.http.post(`${this.endPoint}/get-password-token`, data);
  }

  public checkPasswordToken(token: string) {
    return this.http.get(`${this.endPoint}/check-password-token/${token}`);
  }

  public resetPassword(data: any) {
    return this.http.post(`${this.endPoint}/reset-password`, data);
  }

  public updatePassword(data: any) {
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

  public getIcs(): Observable<UsagerLight[] | []> {
    return this.http.get(`${environment.apiUrl}agenda`).pipe(
      map((response) => {
        return Array.isArray(response) ? response : [response];
      })
    );
  }
}
