import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, Observable, startWith, tap } from "rxjs";
import { environment } from "src/environments/environment";
import {
  AdminStructureListData,
  AdminStructureStatsData,
  StructureAdmin,
} from "../../../../../_common";
import { structuresCache } from "../../store/structuresCache.service";

const BASE_URL = environment.apiUrl + "admin/structures";
@Injectable()
export class AdminStructuresApiClient {
  constructor(public http: HttpClient) {}

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
    id: number,
    token: string
  ): Observable<StructureAdmin> {
    return this.http.get<StructureAdmin>(`${BASE_URL}/confirm/${id}/${token}`);
  }
}
