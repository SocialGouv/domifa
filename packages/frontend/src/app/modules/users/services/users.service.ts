import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class UsersService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "users";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public getUser(id: number) {
    return this.http.get(`${this.endPoint}/${id}`);
  }

  public getUsersByStructure(structureId: number) {
    return this.http.get(`${this.endPoint}/structure/${structureId}`);
  }

  public login(email: string, password: string) {
    return this.http.post<any>(`${this.endPoint}/login`, {
      email,
      password
    });
  }

  public create(data: any) {
    return this.http.post(`${this.endPoint}`, data);
  }
}
