import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StructureDoc } from "@domifa/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class StructureDocService {
  private endPoint = `${environment.apiUrl}structure-docs`;

  constructor(private readonly http: HttpClient) {}

  public upload(data: FormData) {
    return this.http
      .post(`${this.endPoint}`, data, {
        observe: "events",
        reportProgress: true,
      })
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              return { message: progress, status: "progress" };
            }
          } else if (event.type === HttpEventType.Response) {
            return {
              success: true,
              body: event.body as StructureDoc[],
            };
          }
          return { status: "pending", message: 0 };
        })
      );
  }

  public getAllStructureDocs(): Observable<StructureDoc[]> {
    return this.http.get<StructureDoc[]>(this.endPoint);
  }

  public getStructureDoc(docUuid: string) {
    return this.http.get(`${this.endPoint}/${docUuid}`, {
      responseType: "blob",
    });
  }

  public deleteStructureDoc(docUuid: string): Observable<StructureDoc[]> {
    return this.http.delete<StructureDoc[]>(`${this.endPoint}/${docUuid}`);
  }
}
