import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, Observable, startWith, tap } from "rxjs";

import { environment } from "src/environments/environment";
import {
  AdminStructureListData,
  StructureAdmin,
  UserNewAdmin,
} from "../../../../../_common";
import { structuresCache } from "../../store/structuresCache.service";
import { ApiMessage, AdminStructureStatsData } from "@domifa/common";

const BASE_URL = environment.apiUrl + "admin/structures";
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

  public getAdminStructureListData(): Observable<AdminStructureListData> {
    return this.http.get<AdminStructureListData>(BASE_URL).pipe(
      tap((data: AdminStructureListData) => {
        structuresCache.setStructureListData(data);
      }),
      startWith(
        structuresCache.getStructureListData() as AdminStructureListData
      ),
      filter((x) => !!x)
    );
  }

  public getStatsDomifaAdminDashboard(): Observable<AdminStructureStatsData> {
    return this.http.get<AdminStructureStatsData>(`${BASE_URL}/stats`).pipe(
      tap((data: AdminStructureStatsData) => {
        structuresCache.setStructureStatsData(data);
      }),
      startWith(
        structuresCache.getStructureStatsData() as AdminStructureStatsData
      ),
      filter((x) => !!x)
    );
  }

  public exportDashboard() {
    return this.http.get(`${BASE_URL}/export`, {
      responseType: "blob",
    });
  }

  public enableSms(structureId: number) {
    return this.http.put(`${BASE_URL}/sms/enable/${structureId}`, {});
  }

  public enablePortailUsager(structureId: number) {
    return this.http.put(
      `${BASE_URL}/portail-usager/toggle-enable-domifa/${structureId}`,
      {}
    );
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
