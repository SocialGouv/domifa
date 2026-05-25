import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { PageResults, UsersForAdminList } from "@domifa/common";

import { environment } from "src/environments/environment";
import { UserActivityLog } from "../../../manage-users/types/user-activity-log";
import {
  SessionsUserProfile,
  UserSessionsView,
} from "../../components/user-sessions-tab/user-sessions.types";

@Injectable({ providedIn: "root" })
export class AdminUsersApiClient {
  private readonly baseUrl = environment.apiUrl + "admin/users";
  private readonly structuresUrl = environment.apiUrl + "admin/structures";
  private readonly resetPasswordUrl =
    environment.apiUrl + "users/get-password-token";

  constructor(private readonly http: HttpClient) {}

  public getStructureUsers(): Observable<UsersForAdminList[]> {
    return this.http.get<UsersForAdminList[]>(
      `${this.baseUrl}/structure-users`
    );
  }

  public resetPassword(email: string): Observable<void> {
    return this.http.post<void>(this.resetPasswordUrl, { email });
  }

  public elevateUserRole(uuid: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/elevate-user-role`, { uuid });
  }

  public unblockUser(
    structureUuid: string,
    userUuid: string
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.structuresUrl}/structure/${structureUuid}/users/${userUuid}/unblock`,
      {}
    );
  }

  public blockUser(
    structureUuid: string,
    userUuid: string
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.structuresUrl}/structure/${structureUuid}/users/${userUuid}/block`,
      {}
    );
  }

  public unblockSupervisorUser(
    userUuid: string,
    motif: string
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.baseUrl}/supervisor/${userUuid}/unblock`,
      { motif }
    );
  }

  public unblockUserWithMotif(
    structureUuid: string,
    userUuid: string,
    motif: string
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.structuresUrl}/structure/${structureUuid}/users/${userUuid}/unblock`,
      { motif }
    );
  }

  public getStructureUserLogs(
    userUuid: string,
    page: number,
    take: number
  ): Observable<PageResults<UserActivityLog>> {
    const params = new HttpParams()
      .set("page", String(page))
      .set("take", String(take));
    return this.http.get<PageResults<UserActivityLog>>(
      `${this.baseUrl}/structure-user/${userUuid}/logs`,
      { params }
    );
  }

  public getUserSessions(
    userType: SessionsUserProfile,
    userUuid: string
  ): Observable<UserSessionsView> {
    return this.http.get<UserSessionsView>(
      `${environment.apiUrl}admin/security/users/${userType}/${userUuid}/sessions`
    );
  }
}
