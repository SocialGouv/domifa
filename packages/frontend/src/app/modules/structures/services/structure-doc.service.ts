import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { map } from "rxjs/operators";

import { environment } from "src/environments/environment";
import { StructureDoc } from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class StructureDocService {
  private endPoint = environment.apiUrl + "structure-docs";

  constructor(private http: HttpClient) {}

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

  public getAllStructureDocs(): Observable<StructureDoc[]> {
    return this.http.get<StructureDoc[]>(this.endPoint);
  }

  public getStructureDoc(docUuid: string) {
    return this.http.get(this.endPoint + "/" + docUuid, {
      responseType: "blob",
    });
  }

  public deleteStructureDoc(docUuid: string) {
    return this.http.delete(this.endPoint + "/" + docUuid);
  }
}
