import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, Observable, startWith, tap } from "rxjs";

import { environment } from "src/environments/environment";

import { structuresCache } from "../../store/structuresCache.service";

import { ApiMessage, Structure } from "@domifa/common";
import {
  ApiStructureAdmin,
  UserNewAdmin,
} from "../../../admin-structures/types";

const BASE_URL = `${environment.apiUrl}admin/structures`;
@Injectable()
export class AdminStructuresApiClient {
  public http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public deleteSendInitialMail(structureUuid: string) {
    return this.http.put(
      `${environment.apiUrl}admin/structures-delete/send-mail/${structureUuid}`,
      {}
    );
  }

  public deleteCheck(
    structureUuid: string,
    token: string
  ): Observable<Structure> {
    return this.http.put<Structure>(
      `${environment.apiUrl}admin/structures-delete/check-token/${structureUuid}/${token}`,
      {}
    );
  }

  public deleteConfirm(data: {
    uuid: string;
    token: string;
  }): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(
      `${environment.apiUrl}admin/structures-delete/confirm-delete-structure`,
      {
        body: data,
      }
    );
  }

  public confirmNewStructure(
    structureUuid: string,
    token: string
  ): Observable<Structure> {
    return this.http.post<Structure>(`${BASE_URL}/confirm-structure-creation`, {
      uuid: structureUuid,
      token,
    });
  }

  public getAdminStructureListData(): Observable<ApiStructureAdmin[]> {
    return this.http.get<ApiStructureAdmin[]>(BASE_URL).pipe(
      tap((data: ApiStructureAdmin[]) => {
        structuresCache.setStructureListData(data);
      }),
      startWith(structuresCache.getStructureListData()),
      filter((x) => !!x)
    );
  }

  public exportDashboard() {
    return this.http.get(`${environment.apiUrl}admin/structures/export`, {
      responseType: "blob",
    });
  }

  public registerUserStructureAdmin(
    newAdmin: UserNewAdmin
  ): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${environment.apiUrl}admin/users/register-user-structure`,
      newAdmin
    );
  }
}
