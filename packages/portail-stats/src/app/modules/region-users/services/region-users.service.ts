import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ApiMessage,
  RegionManagedRole,
  RegionManagedUser,
  UserDeleteMotif,
} from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export type RegisterRegionUserForm = {
  prenom: string;
  nom: string;
  email: string;
  role: RegionManagedRole;
  department?: string;
  region?: string;
};

@Injectable({
  providedIn: "root",
})
export class RegionUsersService {
  private readonly endPoint = `${environment.apiUrl}admin/region-users`;

  constructor(private readonly http: HttpClient) {}

  public getUsers(): Observable<RegionManagedUser[]> {
    return this.http.get<RegionManagedUser[]>(this.endPoint);
  }

  public registerUser(data: RegisterRegionUserForm): Observable<ApiMessage> {
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
