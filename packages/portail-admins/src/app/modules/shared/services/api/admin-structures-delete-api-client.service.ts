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
      `${BASE_URL}/check/${id}/${token}`,
      {}
    );
  }

  public deleteConfirm(
    id: number,
    token: string,
    name: string
  ): Observable<any> {
    return this.http.delete(`${BASE_URL}/confirm/${id}/${token}/${name}`);
  }
}
