import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { UsersForAdminList } from "@domifa/common";

import { environment } from "src/environments/environment";

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
    structureId: number,
    userId: number
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.structuresUrl}/structure/${structureId}/users/${userId}/unblock`,
      {}
    );
  }

  public blockUser(
    structureId: number,
    userId: number
  ): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(
      `${this.structuresUrl}/structure/${structureId}/users/${userId}/block`,
      {}
    );
  }
}
