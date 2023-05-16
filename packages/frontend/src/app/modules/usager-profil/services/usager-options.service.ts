import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  UsagerOptionsHistory,
  UsagerOptionsTransfert,
  UsagerLight,
  UsagerOptionsProcuration,
  UsagerOptionsHistoryType,
} from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class UsagerOptionsService {
  public endPoint = environment.apiUrl + "usagers-options/";

  constructor(private readonly http: HttpClient) {}

  public findHistory(
    usagerRef: number,
    typeOfOptions: UsagerOptionsHistoryType
  ): Observable<UsagerOptionsHistory[]> {
    return this.http.get<UsagerOptionsHistory[]>(
      `${this.endPoint}historique/${usagerRef}/${typeOfOptions}`
    );
  }

  public editTransfert(
    transfert: UsagerOptionsTransfert,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPoint}transfert/${usagerRef}`,
      transfert
    );
  }

  public deleteTransfert(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPoint}transfert/${usagerRef}`
    );
  }

  public editProcurations(
    procurations: UsagerOptionsProcuration[],
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${this.endPoint}procuration/${usagerRef}`,
      procurations
    );
  }

  public deleteProcuration(
    usagerRef: number,
    indexProcuration: number
  ): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPoint}procuration/${usagerRef}/${indexProcuration}`
    );
  }
}
