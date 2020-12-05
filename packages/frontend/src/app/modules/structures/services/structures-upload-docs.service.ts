import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { regexp } from "src/app/shared/validators";
import { environment } from "src/environments/environment";
import { Doc } from "../../usagers/interfaces/doc";
import { Usager } from "../../usagers/interfaces/usager";
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

  public upload(data: any, usagerId: number) {
    const uploadURL = `${this.endPoint}${usagerId}`;

    return this.http
      .post<any>(uploadURL, data, {
        observe: "events",
        reportProgress: true,
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              return {
                message: progress,
                status: "progress",
              };
            }
          } else if (event.type === HttpEventType.Response) {
            return { success: true, body: event.body };
          }
          return `Unhandled event: ${event.type}`;
        })
      );
  }

  public getDocument(usagerId: number, index: number, doc: Doc) {
    return this.http.get(`${this.endPoint}${usagerId}/${index}`, {
      responseType: "blob",
    });
  }

  public deleteDocument(usagerId: number, index: number) {
    return this.http.delete(`${this.endPoint}${usagerId}/${index}`).pipe(
      map((response) => {
        return new Usager(response);
      })
    );
  }
}
