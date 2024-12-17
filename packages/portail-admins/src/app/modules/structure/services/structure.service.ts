import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MetabaseParams, UserStructure, StructureCommon } from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

const BASE_URL = `${environment.apiUrl}admin/structures`;

export type UserStructureWithSecurity = UserStructure & {
  temporaryTokens: {
    type?: string;
    token?: string;
    validity?: Date;
  };
  events: {
    type: string;
    date: Date;
  };
};

@Injectable({
  providedIn: "root",
})
export class StructureService {
  constructor(private readonly http: HttpClient) {}

  public getStructure(id: number): Observable<StructureCommon> {
    return this.http.get<StructureCommon>(`${BASE_URL}/structure/${id}`);
  }

  public getUsers(id: number): Observable<Array<UserStructureWithSecurity>> {
    return this.http.get<Array<UserStructureWithSecurity>>(
      `${BASE_URL}/structure/${id}/users`
    );
  }

  public getMetabaseUrl(params: MetabaseParams): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${BASE_URL}/metabase-stats`,
      params
    );
  }
}
