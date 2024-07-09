import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StructureCommon } from "@domifa/common";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { StructureCommonWeb } from "../../structures/classes";

@Injectable({
  providedIn: "root",
})
export class ManagePortailUsagersService {
  private endPoint = `${environment.apiUrl}portail-usagers-manager/configure-structure`;

  constructor(private readonly http: HttpClient) {}

  public patchPortailUsagerParams(formData: {
    enabledByStructure: boolean;
    usagerLoginUpdateLastInteraction: boolean;
  }): Observable<StructureCommonWeb> {
    return this.http.patch<StructureCommon>(this.endPoint, formData).pipe(
      map((apiResponse: StructureCommon) => {
        return new StructureCommonWeb(apiResponse);
      })
    );
  }
}
