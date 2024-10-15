import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StructureDoc } from "@domifa/common";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class StructureDocService {
  private endPoint = `${environment.apiUrl}structure-docs`;

  constructor(private readonly http: HttpClient) {}

  public upload(data: FormData): Observable<StructureDoc[]> {
    return this.http.post<StructureDoc[]>(`${this.endPoint}`, data);
  }

  public getAllStructureDocs(): Observable<StructureDoc[]> {
    return this.http.get<StructureDoc[]>(this.endPoint);
  }

  public getStructureDoc(docUuid: string) {
    return this.http.get(`${this.endPoint}/${docUuid}`, {
      responseType: "blob",
    });
  }

  public deleteStructureDoc(docUuid: string): Observable<StructureDoc[]> {
    return this.http.delete<StructureDoc[]>(`${this.endPoint}/${docUuid}`);
  }
}
