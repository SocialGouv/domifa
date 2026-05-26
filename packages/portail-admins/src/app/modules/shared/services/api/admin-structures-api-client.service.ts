import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, tap } from "rxjs";

import { environment } from "src/environments/environment";

import {
  ApiMessage,
  PageResults,
  Structure,
  StructureAdmin,
  StructureDecisionRefusMotif,
  StructureDecisionStatut,
  StructureDecisionSuppressionMotif,
  StructureSessionRecord,
} from "@domifa/common";
import { UserNewAdmin } from "../../../admin-structures/types";
import { StructuresActions } from "../../store/structures";
import { UserActivityLog } from "../../../manage-users/types/user-activity-log";

const BASE_URL = `${environment.apiUrl}admin/structures`;
@Injectable()
export class AdminStructuresApiClient {
  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

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

  public setDecisionStructure(
    structureUuid: string,
    statut: StructureDecisionStatut,
    statutDetail?:
      | StructureDecisionRefusMotif
      | StructureDecisionSuppressionMotif
  ): Observable<StructureAdmin> {
    return this.http
      .patch<StructureAdmin>(
        `${BASE_URL}/structure-decision/${structureUuid}`,
        {
          statut,
          statutDetail,
        }
      )
      .pipe(
        tap((updatedStructure: StructureAdmin) => {
          this.store.dispatch(
            StructuresActions.updateOne({ structure: updatedStructure })
          );
        })
      );
  }

  public deleteStructure(
    structureUuid: string,
    motif?: StructureDecisionSuppressionMotif
  ): Observable<StructureAdmin> {
    return this.http
      .patch<StructureAdmin>(
        `${BASE_URL}/structure-decision/${structureUuid}/delete`,
        { motif }
      )
      .pipe(
        tap((updatedStructure: StructureAdmin) => {
          this.store.dispatch(
            StructuresActions.updateOne({ structure: updatedStructure })
          );
        })
      );
  }

  public getAdminStructureListData(): Observable<StructureAdmin[]> {
    return this.http.get<StructureAdmin[]>(BASE_URL);
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

  public getStructureLogs(
    structureUuid: string,
    page: number,
    take: number
  ): Observable<PageResults<UserActivityLog>> {
    const params = new HttpParams()
      .set("page", String(page))
      .set("take", String(take));
    return this.http.get<PageResults<UserActivityLog>>(
      `${BASE_URL}/${structureUuid}/logs`,
      { params }
    );
  }

  public getStructureSecurityLogs(
    structureUuid: string,
    page: number,
    take: number
  ): Observable<PageResults<UserActivityLog>> {
    const params = new HttpParams()
      .set("page", String(page))
      .set("take", String(take));
    return this.http.get<PageResults<UserActivityLog>>(
      `${BASE_URL}/${structureUuid}/security-logs`,
      { params }
    );
  }

  public getStructureSessions(
    structureUuid: string
  ): Observable<StructureSessionRecord[]> {
    return this.http.get<StructureSessionRecord[]>(
      `${BASE_URL}/${structureUuid}/sessions`
    );
  }
}
