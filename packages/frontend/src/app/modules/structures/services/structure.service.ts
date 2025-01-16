import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { StructureCommonWeb } from "../classes";
import {
  StructureCommon,
  Structure,
  UserStructure,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class StructureService {
  private endPoint = environment.apiUrl + "structures";

  constructor(private readonly http: HttpClient) {}

  public findOne(structureId: number): Observable<StructureCommon> {
    return this.http.get<StructureCommon>(`${this.endPoint}/${structureId}`);
  }

  public findMyStructure(): Observable<StructureCommon> {
    return this.http
      .get(`${this.endPoint}/ma-structure`)
      .pipe(map((response) => new StructureCommonWeb(response)));
  }

  public find(codePostal: string): Observable<StructureCommon[]> {
    return this.http.post(`${this.endPoint}/code-postal`, { codePostal }).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new StructureCommonWeb(item))
          : [new StructureCommonWeb(response)];
      })
    );
  }

  public create(dto: {
    structure: Partial<Structure>;
    user: Partial<UserStructure>;
  }): Observable<StructureCommon> {
    return this.http
      .post(`${this.endPoint}`, {
        structure: {
          ...dto.structure,
          readCgu: true,
          acceptCgu: true,
        },
        user: dto.user,
      })
      .pipe(
        map((response) => {
          return new StructureCommonWeb(response);
        })
      );
  }

  public prePost(structure: Partial<Structure>): Observable<StructureCommon> {
    return this.http.post(`${this.endPoint}/pre-post`, structure).pipe(
      map((response) => {
        return new StructureCommonWeb(response);
      })
    );
  }

  public patch(structure: Structure): Observable<StructureCommon> {
    return this.http
      .patch(`${this.endPoint}`, {
        ...structure,
        readCgu: true,
        acceptCgu: true,
      })
      .pipe(
        map((response) => {
          return new StructureCommonWeb(response);
        })
      );
  }

  public patchSmsParams(structure: Structure): Observable<StructureCommon> {
    return this.http
      .patch(`${this.endPoint}/sms`, structure)
      .pipe(map((response) => new StructureCommonWeb(response)));
  }

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.endPoint}/validate-email`, {
      email,
    });
  }

  public hardReset() {
    return this.http.get(`${this.endPoint}/hard-reset`);
  }

  public hardResetConfirm(token: string) {
    return this.http.get(`${this.endPoint}/hard-reset-confirm/${token}`);
  }

  public export(statut: UsagersFilterCriteriaStatut): Observable<Blob> {
    const url = `${environment.apiUrl}export/${statut}`;
    return this.http.get(url, {
      responseType: "blob",
    });
  }
}
