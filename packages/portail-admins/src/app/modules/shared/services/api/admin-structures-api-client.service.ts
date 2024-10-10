import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, Observable, startWith, tap } from "rxjs";

import { environment } from "src/environments/environment";

import { structuresCache } from "../../store/structuresCache.service";

import { ApiMessage } from "@domifa/common";
import { StructureAdmin, UserNewAdmin } from "../../../admin-structures/types";

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
  ): Observable<StructureAdmin> {
    return this.http.put<StructureAdmin>(
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
  ): Observable<StructureAdmin> {
    return this.http.post<StructureAdmin>(
      `${BASE_URL}/confirm-structure-creation`,
      {
        uuid: structureUuid,
        token,
      }
    );
  }

  public getAdminStructureListData(): Observable<StructureAdmin[]> {
    return this.http.get<StructureAdmin[]>(BASE_URL).pipe(
      tap((data: StructureAdmin[]) => {
        structuresCache.setStructureListData(data);
      }),
      startWith(structuresCache.getStructureListData() as StructureAdmin[]),
      filter((x) => !!x)
    );
  }

  public exportDashboard() {
    return this.http.get(`${BASE_URL}/export`, {
      responseType: "blob",
    });
  }

  public postNewAdmin(newAdmin: UserNewAdmin): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${BASE_URL}/register-new-admin`,
      newAdmin
    );
  }

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${environment.apiUrl}users/validate-email`,
      { email }
    );
  }
}
