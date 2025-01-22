import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserStructure, UserStructureRole, ApiMessage } from "@domifa/common";
import { BehaviorSubject, Observable, map } from "rxjs";
import {
  UserStructureEditProfile,
  UserStructureProfile,
  UsagerLight,
} from "../../../../_common/model";
import { environment } from "../../../../environments/environment";
import { userStructureBuilder } from "../../users/services";

@Injectable({
  providedIn: "root",
})
export class ManageUsersService {
  private endPoint = environment.apiUrl + "users";
  private usersSubject = new BehaviorSubject<UserStructureProfile[]>([]);

  readonly users$ = this.usersSubject.asObservable();
  readonly usersMap: { [key: number]: string } = {};
  public users: UserStructureProfile[] = [];

  constructor(private readonly http: HttpClient) {
    this.http.get<UserStructureProfile[]>(this.endPoint).subscribe((users) => {
      this.usersSubject.next(users);
      this.users = users;
      users.forEach((user) => {
        this.usersMap[user.id] = `${user.nom} ${user.prenom}`;
      });
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

  public getLastPasswordUpdate(): Observable<Date | null> {
    return this.http.get<Date | null>(`${this.endPoint}/last-password-update`);
  }

  public agenda(): Observable<UsagerLight[]> {
    return this.http.get<UsagerLight[]>(`${environment.apiUrl}agenda`);
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
}
