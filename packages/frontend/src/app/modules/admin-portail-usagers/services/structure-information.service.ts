import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { StructureInformation } from "@domifa/common";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StructureInformationService {
  private endPoint = `${environment.apiUrl}structure-information`;

  constructor(private readonly http: HttpClient) {}

  public getAllStructureInformation(
    params?: HttpParams
  ): Observable<StructureInformation[]> {
    return this.http.get<StructureInformation[]>(this.endPoint, {
      params,
    });
  }

  public createStructureInformation(
    data: Partial<StructureInformation>
  ): Observable<Partial<StructureInformation>> {
    return this.http.post<Partial<StructureInformation>>(this.endPoint, data);
  }

  public updateStructureInformation(
    uuid: string,
    data: Partial<Partial<StructureInformation>>
  ): Observable<StructureInformation[]> {
    return this.http.patch<StructureInformation[]>(
      `${this.endPoint}/${uuid}`,
      data
    );
  }

  public deleteStructureInformation(
    uuid: string
  ): Observable<StructureInformation[]> {
    return this.http.delete<StructureInformation[]>(`${this.endPoint}/${uuid}`);
  }
}
