import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserSupervisorRole, ApiMessage, UserSupervisor } from "@domifa/common";
import { BehaviorSubject, Observable, map } from "rxjs";

import { environment } from "../../../../environments/environment";
import { differenceInCalendarDays } from "date-fns";

@Injectable({
  providedIn: "root",
})
export class ManageUsersService {
  private endPoint = environment.apiUrl + "users";
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

  public updateRole(
    uuid: string,
    role: UserSupervisorRole
  ): Observable<UserSupervisor> {
    return this.http.patch<UserSupervisor>(
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
