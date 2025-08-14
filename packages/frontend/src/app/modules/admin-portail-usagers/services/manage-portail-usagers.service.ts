import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  PageOptions,
  PageResults,
  StructureCommon,
  UsagersCountByStatus,
  UserUsagerWithUsagerInfo,
} from "@domifa/common";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { StructureCommonWeb } from "../../structures/classes";

@Injectable({
  providedIn: "root",
})
export class ManagePortailUsagersService {
  private readonly endPoint = `${environment.apiUrl}portail-usagers-manager`;

  constructor(private readonly http: HttpClient) {}

  public patchPortailUsagerParams(formData: {
    enabledByStructure: boolean;
    usagerLoginUpdateLastInteraction: boolean;
  }): Observable<StructureCommonWeb> {
    return this.http
      .patch<StructureCommon>(`${this.endPoint}/configure-structure`, formData)
      .pipe(
        map((apiResponse: StructureCommon) => {
          return new StructureCommonWeb(apiResponse);
        })
      );
  }

  public activateAllUserUsagerAccounts(): Observable<
    PageResults<UserUsagerWithUsagerInfo>
  > {
    return this.http.get<PageResults<UserUsagerWithUsagerInfo>>(
      `${this.endPoint}/generate-all-accounts`
    );
  }

  public getAllAccounts(
    pageOptions: PageOptions
  ): Observable<PageResults<UserUsagerWithUsagerInfo>> {
    return this.http.post<PageResults<UserUsagerWithUsagerInfo>>(
      `${this.endPoint}/all-accounts`,
      pageOptions
    );
  }

  public getAllAccountsStats(): Observable<UsagersCountByStatus> {
    return this.http.get<UsagersCountByStatus>(`${this.endPoint}/stats`);
  }

  public exportAccountsToExcel(): Observable<Blob> {
    return this.http.get(`${this.endPoint}/export/all-accounts`, {
      responseType: "blob",
    });
  }
}
