import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, Observable, startWith, tap } from "rxjs";

import { environment } from "src/environments/environment";
import {
  AdminStructureListData,
  AdminStructureStatsData,
  StructureAdmin,
  UserNewAdmin,
} from "../../../../../_common";
import { ApiMessage } from "../../../../../_common/_core";
import { structuresCache } from "../../store/structuresCache.service";

const BASE_URL = environment.apiUrl + "admin/structures";
@Injectable()
export class AdminStructuresApiClient {
  public http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
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

  public confirmNewStructure(
    structureId: number,
    token: string
  ): Observable<StructureAdmin> {
    return this.http.post<StructureAdmin>(
      `${BASE_URL}/confirm-structure-creation`,
      {
        structureId,
        token,
      }
    );
  }

  public postNewAdmin(newAdmin: UserNewAdmin): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${BASE_URL}/register`, newAdmin);
  }

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${environment.apiUrl}users/validate-email`,
      { email }
    );
  }
}
