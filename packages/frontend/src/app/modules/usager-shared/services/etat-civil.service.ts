import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerLight } from "../../../../_common/model";
import { usagersCache } from "../../../shared/store";
import { UsagerFormModel } from "../interfaces";

@Injectable({
  providedIn: "root",
})
export class EtatCivilService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public patchEtatCivil(usager: UsagerFormModel): Observable<UsagerLight> {
    const response = this.http
      .patch<UsagerLight>(`${this.endPointUsagers}/${usager.ref}`, usager)
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersCache.updateUsager(newUsager);
          return newUsager;
        })
      );
    return response;
  }
}
