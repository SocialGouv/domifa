import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "../interfaces/user";
import { Usager } from "../../usagers/interfaces/usager";
import { UserRole } from "../interfaces/user-role.type";
import { UserProfil } from "../interfaces/user-profil.type";

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
        return new User(response);
      })
    );
  }

  public validateEmail(email: string): Observable<any> {
    return this.http.post(`${this.endPoint}/validate-email`, { email });
  }

  public create(data: any) {
    return this.http.post(`${this.endPoint}`, data).pipe(
      map((response) => {
        return new User(response);
      })
    );
  }

  public patch(data: any) {
    return this.http.patch(`${this.endPoint}`, data).pipe(
      map((response) => {
        return new User(response);
      })
    );
  }

  public getUsers(): Observable<UserProfil[]> {
    return this.http.get(`${this.endPoint}`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new User(item))
          : [new User(response)];
      })
    );
  }

  public getUsersMeeting(): Observable<User[]> {
    return this.http.get(environment.apiUrl + "agenda/users").pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new User(item))
          : [new User(response)];
      })
    );
  }

  public getNewUsers(): Observable<UserProfil[]> {
    return this.http.get(`${this.endPoint}/to-confirm`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new User(item))
          : [new User(response)];
      })
    );
  }

  public confirmUser(id: number): Observable<UserProfil> {
    return this.http.get(`${this.endPoint}/confirm/${id}`).pipe(
      map((response) => {
        return new User(response);
      })
    );
  }

  public updateRole(id: number, role: UserRole): Observable<UserProfil> {
    return this.http.get(`${this.endPoint}/update-role/${id}/${role}`).pipe(
      map((response) => {
        return new User(response);
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

  public tipi() {
    return this.http.get(`${this.endPoint}/tipi`);
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

  public agenda(): Observable<Usager[] | []> {
    return this.http.get(`${environment.apiUrl}agenda`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new Usager(item))
          : [new Usager(response)];
      })
    );
  }

  public getIcs(): Observable<Usager[] | []> {
    return this.http.get(`${environment.apiUrl}agenda`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new Usager(item))
          : [new Usager(response)];
      })
    );
  }
}
