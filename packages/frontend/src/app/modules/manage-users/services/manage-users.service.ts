import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  UserStructure,
  UserStructureRole,
  ApiMessage,
  UserStructureProfile,
} from "@domifa/common";
import { BehaviorSubject, Observable, map } from "rxjs";
import {
  UserStructureEditProfile,
  UsagerLight,
} from "../../../../_common/model";
import { environment } from "../../../../environments/environment";
import { userStructureBuilder } from "../../users/services";
import { differenceInCalendarDays } from "date-fns";

@Injectable({
  providedIn: "root",
})
export class ManageUsersService {
  private endPoint = environment.apiUrl + "users";
  private usersSubject = new BehaviorSubject<UserStructureProfile[]>([]);

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

  readonly referrers$ = this.users$.pipe(
    map((users) => users.filter((user) => user.role !== "facteur"))
  );

  readonly referrersMap$ = this.referrers$.pipe(
    map((referrers) => {
      const map: { [key: number]: string } = {};
      referrers.forEach((user) => {
        map[user.id] = `${user.nom} ${user.prenom}`;
      });
      return map;
    })
  );

  constructor(private readonly http: HttpClient) {
    this.loadUsers();
  }

  public loadUsers(): void {
    this.http.get<UserStructureProfile[]>(this.endPoint).subscribe((users) => {
      this.usersSubject.next(users);
    });
  }

  public patch(userInfos: UserStructureEditProfile): Observable<UserStructure> {
    return this.http.patch(`${this.endPoint}`, userInfos).pipe(
      map((response) => {
        return userStructureBuilder.buildUserStructure(response);
      })
    );
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

  // Assign referrers from another user
  public reassignReferrers(
    sourceUser: Pick<UserStructureProfile, "uuid">,
    targetUserId: number | null
  ): Observable<ApiMessage> {
    return this.http.get<ApiMessage>(
      `${this.endPoint}/reassign-referrers/${sourceUser.uuid}`,
      {
        params: {
          newReferrerId: targetUserId,
        },
      }
    );
  }

  public countReferrers(
    user: Pick<UserStructureProfile, "uuid">
  ): Observable<number> {
    return this.http.get<number>(
      `${this.endPoint}/count-referrers/${user.uuid}`
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
