import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiMessage, PageResults, UserSupervisor } from "@domifa/common";
import { BehaviorSubject, Observable, map } from "rxjs";

import { environment } from "../../../../environments/environment";
import { UserActivityLog } from "../types/user-activity-log";

@Injectable({
  providedIn: "root",
})
export class ManageUsersService {
  private readonly endPoint = environment.apiUrl + "admin/users";
  private readonly usersSubject = new BehaviorSubject<UserSupervisor[]>([]);

  // Observables dérivés
  readonly users$ = this.usersSubject.pipe(
    map((users) =>
      users.map((user) => ({
        ...user,
        lastLogin: user?.lastLogin ? new Date(user.lastLogin) : null,
      }))
    )
  );

  constructor(private readonly http: HttpClient) {
    this.loadUsers();
  }

  public loadUsers(): void {
    this.http.get<UserSupervisor[]>(this.endPoint).subscribe((users) => {
      this.usersSubject.next(users);
    });
  }

  public updateUser(
    uuid: string,
    data: Partial<UserSupervisor>
  ): Observable<UserSupervisor> {
    return this.http.patch<UserSupervisor>(`${this.endPoint}/${uuid}`, data);
  }

  public deleteUser(uuid: string): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.endPoint}/${uuid}`);
  }

  public blockSupervisorUser(userUuid: string): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.endPoint}/supervisor/${userUuid}/block`,
      {}
    );
  }

  public unblockSupervisorUser(
    userUuid: string,
    motif: string
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.endPoint}/supervisor/${userUuid}/unblock`,
      { motif }
    );
  }

  public getSupervisorUserLogs(
    userUuid: string,
    page: number,
    take: number
  ): Observable<PageResults<UserActivityLog>> {
    const params = new HttpParams()
      .set("page", String(page))
      .set("take", String(take));
    return this.http.get<PageResults<UserActivityLog>>(
      `${this.endPoint}/supervisor/${userUuid}/logs`,
      { params }
    );
  }

  public getLastPasswordUpdate(): Observable<Date | null> {
    return this.http.get<Date | null>(`${this.endPoint}/last-password-update`);
  }

  public registerUserSupervisor(data: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.endPoint}/register-user-supervisor`,
      data
    );
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
