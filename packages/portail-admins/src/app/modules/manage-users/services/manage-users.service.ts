import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiMessage, UserSupervisor } from "@domifa/common";
import { BehaviorSubject, Observable, map } from "rxjs";

import { environment } from "../../../../environments/environment";
import { differenceInCalendarDays } from "date-fns";

@Injectable({
  providedIn: "root",
})
export class ManageUsersService {
  private endPoint = environment.apiUrl + "admin/users";
  private usersSubject = new BehaviorSubject<UserSupervisor[]>([]);

  // Observables dérivés
  readonly users$ = this.usersSubject.pipe(
    map((users) =>
      users.map((user) => ({
        ...user,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        verified: user.lastLogin
          ? differenceInCalendarDays(new Date(), new Date(user.lastLogin)) < 60
          : false,
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
