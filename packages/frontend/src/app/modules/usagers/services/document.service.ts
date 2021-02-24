import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerDoc } from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  public endPoint: string;

  constructor(private http: HttpClient) {
    this.endPoint = environment.apiUrl + "docs/";
  }

  public upload(data: any, usagerRef: number) {
    const uploadURL = `${this.endPoint}${usagerRef}`;

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
            return { success: true, body: event.body as UsagerDoc[] };
          }
          return `Unhandled event: ${event.type}`;
        })
      );
  }

  public getDocument(usagerRef: number, index: number) {
    return this.http.get(`${this.endPoint}${usagerRef}/${index}`, {
      responseType: "blob",
    });
  }

  public deleteDocument(usagerRef: number, index: number) {
    return this.http.delete<UsagerDoc[]>(
      `${this.endPoint}${usagerRef}/${index}`
    );
  }

  public getCustomDoc(usagerRef: number) {
    return this.http.get(`${environment.apiUrl}docs-custom/${usagerRef}`, {
      responseType: "blob",
    });
  }
}
