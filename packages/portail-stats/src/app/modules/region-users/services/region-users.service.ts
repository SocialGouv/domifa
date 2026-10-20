import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ApiMessage,
  RegionDepartmentUser,
  UserDeleteMotif,
} from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export type RegisterDepartmentUserForm = {
  prenom: string;
  nom: string;
  email: string;
  department: string;
};

@Injectable({
  providedIn: "root",
})
export class RegionUsersService {
  private readonly endPoint = `${environment.apiUrl}admin/region-users`;

  constructor(private readonly http: HttpClient) {}

  public getUsers(): Observable<RegionDepartmentUser[]> {
    return this.http.get<RegionDepartmentUser[]>(this.endPoint);
  }

  public registerUser(
    data: RegisterDepartmentUserForm
  ): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(this.endPoint, data);
  }

  public deleteUser(
    uuid: string,
    motif: UserDeleteMotif
  ): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.endPoint}/${uuid}`, {
      body: { motif },
    });
  }
}
