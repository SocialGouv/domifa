import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { saveAs } from "file-saver";

import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerDoc } from "../../../../_common/model";
import { StructureDocTypesAvailable } from "../../../../_common/model/structure-doc";
import { LoadingService } from "../../loading/loading.service";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  public endPoint: string;
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    private notifService: ToastrService
  ) {
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

  /* Attestation */
  public attestation(usagerRef: number): void {
    this.loadingService.startLoading();

    this.http
      .get(`${this.endPointUsagers}/attestation/${usagerRef}`, {
        responseType: "blob",
      })
      .subscribe(
        (x) => {
          const newBlob = new Blob([x], { type: "application/pdf" });
          const randomNumber = Math.floor(Math.random() * 100) + 1;

          saveAs(
            newBlob,
            "attestation_" + usagerRef + "_" + randomNumber + ".pdf"
          );

          setTimeout(() => {
            this.loadingService.stopLoading();
          }, 500);
        },
        () => {
          this.notifService.error(
            "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.loadingService.stopLoading();
        }
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

  public getStructureDoc(
    usagerId: number,
    docType: StructureDocTypesAvailable
  ) {
    return this.http.get(
      `${environment.apiUrl}usagers-structure-docs/${usagerId}/${docType}`,
      {
        responseType: "blob",
      }
    );
  }
}
