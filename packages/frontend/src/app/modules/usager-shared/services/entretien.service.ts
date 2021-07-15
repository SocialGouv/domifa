import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersSearchCache } from "../../../shared/store";
import { Entretien } from "../../usagers/interfaces/entretien";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class EntretienService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public submitEntretien(
    entretien: Entretien,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(
        `${this.endPointUsagers}/entretien/${usagerRef}`,
        entretien
      )
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersSearchCache.updateUsager(newUsager);
          return newUsager;
        })
      );
  }
}
