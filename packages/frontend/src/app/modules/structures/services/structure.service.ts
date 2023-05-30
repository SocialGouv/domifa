import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  Structure,
  StructureCommon,
  UserStructure,
} from "../../../../_common/model";
import { departementHelper } from "./departement-helper.service";
import { StructureCommonWeb } from "./StructureCommonWeb.type";

@Injectable({
  providedIn: "root",
})
export class StructureService {
  private endPoint = environment.apiUrl + "structures";

  constructor(private readonly http: HttpClient) {}

  public findOne(structureId: number): Observable<StructureCommon> {
    return this.http.get<StructureCommon>(`${this.endPoint}/${structureId}`);
  }

  public findMyStructure(): Observable<StructureCommon> {
    return this.http.get(`${this.endPoint}/ma-structure`).pipe(
      map((response) => {
        return new StructureCommonWeb(response);
      })
    );
  }

  public find(codePostal: string): Observable<StructureCommon[]> {
    return this.http.post(`${this.endPoint}/code-postal`, { codePostal }).pipe(
      map((response) => {
        return Array.isArray(response)
          ? response.map((item) => new StructureCommonWeb(item))
          : [new StructureCommonWeb(response)];
      })
    );
  }

  public create(dto: {
    structure: Partial<Structure>;
    user: Partial<UserStructure>;
  }): Observable<StructureCommon> {
    return this.http
      .post(`${this.endPoint}`, {
        structure: {
          ...dto.structure,
          readCgu: true,
          acceptCgu: true,
        },
        user: dto.user,
      })
      .pipe(
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
    return this.http
      .patch(`${this.endPoint}`, {
        ...structure,
        readCgu: true,
        acceptCgu: true,
      })
      .pipe(
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

  public patchPortailUsagerParams(formData: {
    enabledByStructure: boolean;
    usagerLoginUpdateLastInteraction: boolean;
  }): Observable<StructureCommon> {
    return this.http
      .patch(
        environment.apiUrl + "structures/portail-usager/configure-structure",
        formData
      )
      .pipe(
        map((response) => {
          return new StructureCommonWeb(response);
        })
      );
  }

  public validateEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.endPoint}/validate-email`, {
      email,
    });
  }

  public hardReset() {
    return this.http.get(`${this.endPoint}/hard-reset`);
  }

  public hardResetConfirm(token: string) {
    return this.http.get(`${this.endPoint}/hard-reset-confirm/${token}`);
  }

  public export() {
    return this.http.get(`${environment.apiUrl}export`, {
      responseType: "blob",
    });
  }

  public codePostalValidator() {
    return function validateCodePostal(control: AbstractControl) {
      const postalCode = control.value;

      const testCode = RegExp(/^[0-9][0-9AB][0-9]{3}$/).test(postalCode);
      if (testCode) {
        try {
          const departement =
            departementHelper.getDepartementFromCodePostal(postalCode);
          departementHelper.getRegionCodeFromDepartement(departement);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Validation error for postalCode "${postalCode}"`, err);
          return { codepostal: false };
        }
        return null;
      }

      return { codepostal: false };
    };
  }
}
