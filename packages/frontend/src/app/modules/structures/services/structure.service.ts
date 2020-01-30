import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Structure } from "../structure.interface";

@Injectable({
  providedIn: "root"
})
export class StructureService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "structures";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public findOne(structureId: number): Observable<any> {
    return this.http.get(`${this.endPoint}/${structureId}`);
  }

  public findAll(): Observable<any> {
    return this.http.get(`${this.endPoint}`);
  }

  public create(structure: Structure): Observable<any> {
    return structure.id !== 0
      ? this.http.patch(`${this.endPoint}`, structure)
      : this.http.post(`${this.endPoint}`, structure);
  }

  public confirm(token: string): Observable<any> {
    return this.http.get(`${this.endPoint}/confirm/${token}`);
  }

  public delete(token: string): Observable<any> {
    return this.http.delete(`${this.endPoint}/${token}`);
  }

  public validateEmail(email: string): Observable<any> {
    return this.http.post(`${this.endPoint}/validate-email`, { email });
  }

  public hardReset() {
    return this.http.get(`${this.endPoint}/hard-reset`);
  }

  public hardResetConfirm(token: string) {
    return this.http.get(`${this.endPoint}/hard-reset-confirm/${token}`);
  }
}
