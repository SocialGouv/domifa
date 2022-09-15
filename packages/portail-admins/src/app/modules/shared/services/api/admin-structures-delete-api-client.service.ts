import { ApiMessage } from "./../../../../../_common/_core/ApiMessage.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { StructureAdmin } from "../../../../../_common";

const BASE_URL = environment.apiUrl + "admin/structures-delete";

@Injectable()
export class AdminStructuresDeleteApiClient {
  constructor(public http: HttpClient) {}

  public deleteSendInitialMail(structureId: number) {
    return this.http.put(`${BASE_URL}/send-mail/${structureId}`, {});
  }

  public deleteCheck(id: number, token: string): Observable<StructureAdmin> {
    return this.http.put<StructureAdmin>(
      `${BASE_URL}/check-token/${id}/${token}`,
      {}
    );
  }

  public deleteConfirm(data: {
    structureId: number;
    token: string;
    structureName: string;
  }): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(
      `${BASE_URL}/confirm-delete-structure`,
      {
        body: data,
      }
    );
  }
}
