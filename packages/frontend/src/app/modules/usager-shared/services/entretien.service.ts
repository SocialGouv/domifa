import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
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
    return this.http.post<UsagerLight>(
      `${this.endPointUsagers}/entretien/${usagerRef}`,
      entretien
    );
  }
}
