import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { map } from "rxjs/operators";

import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class StructureDocService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "structure-doc";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public upload(data: any) {
    const uploadURL = `${this.endPoint}`;

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

  public getAllStructureDocs(): Observable<any> {
    return this.http.get(this.endPoint);
  }

  public getStructureDoc(docId: number) {
    return this.http.get(this.endPoint + "/" + docId, {
      responseType: "blob",
    });
  }

  public deleteStructureDoc(docId: number) {
    return this.http.delete(this.endPoint + "/" + docId);
  }
}
