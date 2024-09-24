import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StructureInformation } from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class StructureInformationService {
  private endPoint = `${environment.apiUrl}portail-usagers/profile/structure-information`;

  constructor(private readonly http: HttpClient) {}

  public getAllStructureInformation(
    params?: HttpParams,
  ): Observable<StructureInformation[]> {
    return this.http.get<StructureInformation[]>(this.endPoint, {
      params,
    });
  }
}
