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

  public create(data: any) {
    return this.http.post(`${this.endPoint}`, data);
  }

  public getUsersByStructure(structureId: number) {
    return this.http.get(`${this.endPoint}/structure/${structureId}`);
  }

  public getPasswordToken(data: string) {
    return this.http.post(`${this.endPoint}/get-password-token`, data);
  }

  public checkPasswordToken(token: string) {
    return this.http.get(`${this.endPoint}/check-password-token/${token}`);
  }

  public resetPassword(data: string) {
    return this.http.post(`${this.endPoint}/reset-password`, data);
  }
}
