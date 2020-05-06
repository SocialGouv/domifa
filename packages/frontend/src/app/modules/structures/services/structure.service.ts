import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Structure } from "../structure.interface";
import { LoadingService } from "../../loading/loading.service";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
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

  public findMyStructure(): Observable<Structure> {
    return this.http.get(`${this.endPoint}/ma-structure`).pipe(
      map((response) => {
        return new Structure(response);
      })
    );
  }

  public find(codePostal: string): Observable<any> {
    return this.http.get(`${this.endPoint}/code-postal/${codePostal}`);
  }

  public findAll(): Observable<any> {
    return this.http.get(`${this.endPoint}`);
  }

  public create(structure: Structure): Observable<any> {
    return this.http.post(`${this.endPoint}`, structure).pipe(
      map((response) => {
        return new Structure(response);
      })
    );
  }

  public prePost(structure: Structure): Observable<any> {
    return this.http.post(`${this.endPoint}/pre-post`, structure).pipe(
      map((response) => {
        return new Structure(response);
      })
    );
  }

  public patch(structure: Structure): Observable<any> {
    return this.http.patch(`${this.endPoint}`, structure).pipe(
      map((response) => {
        return new Structure(response);
      })
    );
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

  public continueRegister() {
    return this.http.get(`${this.endPoint}/continue-register`);
  }

  public export() {
    return this.http.get(`${environment.apiUrl}export`, {
      responseType: "blob",
    });
  }
}
