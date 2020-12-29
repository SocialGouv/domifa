import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { regexp } from "src/app/shared/validators";
import { environment } from "src/environments/environment";
import { Structure } from "../structure.interface";
import { DepartementHelper } from "./departement-helper.service";

@Injectable({
  providedIn: "root",
})
export class StructureService {
  public http: HttpClient;
  public departementHelper: DepartementHelper;
  private endPoint = environment.apiUrl + "structures";

  constructor(http: HttpClient, departementHelper: DepartementHelper) {
    this.http = http;
    this.departementHelper = departementHelper;
  }

  public findOne(structureId: number): Observable<any> {
    return this.http.get(`${this.endPoint}/${structureId}`);
  }

  public findMyStructure(): Observable<Structure> {
    console.log("findMyStructure");
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

  public confirm(id: string, token: string): Observable<any> {
    return this.http.get(`${this.endPoint}/confirm/${id}/${token}`);
  }

  public delete(id: string, token: string, name: string): Observable<any> {
    return this.http.delete(`${this.endPoint}/confirm/${id}/${token}/${name}`);
  }

  public deleteCheck(id: string, token: string): Observable<any> {
    return this.http.delete(`${this.endPoint}/check/${id}/${token}`).pipe(
      map((response) => {
        return new Structure(response);
      })
    );
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

  public codePostalValidator() {
    const departementHelper = this.departementHelper;
    return function validateCodePostal(control: AbstractControl) {
      const postalCode = control.value;

      const testCode = RegExp(regexp.postcode).test(postalCode);
      if (testCode) {
        try {
          const departement = departementHelper.getDepartementFromCodePostal(
            postalCode
          );
          departementHelper.getRegionCodeFromDepartement(departement);
        } catch (err) {
          // tslint:disable-next-line: no-console
          console.error(`Validation error for postalCode "${postalCode}"`, err);
          return { codepostal: false };
        }
        return null;
      }

      return { codepostal: false };
    };
  }
}
