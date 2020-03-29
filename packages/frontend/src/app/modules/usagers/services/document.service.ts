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
    this.endPoint = environment.apiUrl + "usagers/document/";
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

  /* DOCUMENT  */
  public getDocument(usagerId: number, index: number, doc: Doc) {
    this.http
      .get(`${this.endPoint}${usagerId}/${index}`, { responseType: "blob" })
      .subscribe((x) => {
        this.download(usagerId, doc, x);
      });
  }

  public download(usagerId: number, doc: Doc, x: any) {
    const extensionTmp = doc.filetype.split("/");
    const extension = extensionTmp[1];

    const newBlob = new Blob([x], { type: doc.filetype });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }
    const data = window.URL.createObjectURL(newBlob);
    const link = document.createElement("a");
    link.href = data;
    link.download = "document_" + usagerId + "." + extension;

    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    setTimeout(() => {
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
  }

  public deleteDocument(usagerId: number, index: number) {
    return this.http.delete(`${this.endPoint}${usagerId}/${index}`).pipe(
      map((response) => {
        return new Usager(response);
      })
    );
  }
}
