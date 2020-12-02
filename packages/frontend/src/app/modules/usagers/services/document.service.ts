import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Doc } from "../interfaces/doc";
import { Usager } from "../interfaces/usager";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  public http: HttpClient;
  public endPoint: string;

  constructor(http: HttpClient) {
    this.http = http;
    this.endPoint = environment.apiUrl + "docs/";
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

  public getCustomDoc(usagerId: number) {
    return this.http.get(`${environment.apiUrl}docs-custom/${usagerId}`, {
      responseType: "blob",
    });
  }
}
