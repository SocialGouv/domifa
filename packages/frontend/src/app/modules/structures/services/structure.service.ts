import { MessageSms } from "./../../../../_common/model/message-sms/MessageSms.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { regexp } from "src/app/shared/validators";
import { environment } from "src/environments/environment";
import { AppUser, Structure, StructureCommon } from "../../../../_common/model";
import { DepartementHelper } from "./departement-helper.service";
import { StructureCommonWeb } from "./StructureCommonWeb.type";

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

  public findMyStructure(): Observable<StructureCommon> {
    return this.http.get(`${this.endPoint}/ma-structure`).pipe(
      map((response) => {
        return new StructureCommonWeb(response);
      })
    );
  }

  public find(codePostal: string): Observable<StructureCommon[]> {
    return this.http.get(`${this.endPoint}/code-postal/${codePostal}`).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new StructureCommonWeb(item))
          : [new StructureCommonWeb(response)];
      })
    );
  }

  public create(dto: {
    structure: Partial<Structure>;
    user: Partial<AppUser>;
  }): Observable<StructureCommon> {
    return this.http.post(`${this.endPoint}`, dto).pipe(
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
    return this.http.patch(`${this.endPoint}`, structure).pipe(
      map((response) => {
        return new StructureCommonWeb(response);
      })
    );
  }

  public patchSmsParams(structure: Structure): Observable<StructureCommon> {
    return this.http.patch(`${this.endPoint}/sms`, structure).pipe(
      map((response) => {
        return new StructureCommonWeb(response);
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
        return new StructureCommonWeb(response);
      })
    );
  }

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post(`${this.endPoint}/validate-email`, { email }).pipe(
      map((response: boolean) => {
        return response;
      })
    );
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

  public smsTimeline(): Observable<MessageSms[]> {
    return this.http.get(`${environment.apiUrl}sms/timeline`).pipe(
      map((response: MessageSms[]) => {
        return response;
      })
    );
  }
}
