import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
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

  public validateEmail(email: string): Observable<any> {
    return this.http.post(`${this.endPoint}/validate-email`, { email });
  }

  public create(data: any) {
    return this.http.post(`${this.endPoint}`, data);
  }

  public getUsers() {
    return this.http.get(`${this.endPoint}`);
  }

  public confirmUser(id: number) {
    return this.http.get(`${this.endPoint}/confirm/${id}`);
  }

  public updateRole(id: number, role: string) {
    return this.http.get(`${this.endPoint}/update-role/${id}/${role}`);
  }

  public deleteUser(id: number) {
    return this.http.delete(`${this.endPoint}/${id}`);
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

  public hardReset() {
    return this.http.get(`${this.endPoint}/hard-reset`);
  }
}
