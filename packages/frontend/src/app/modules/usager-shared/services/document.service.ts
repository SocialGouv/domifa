import { Observable } from "rxjs";
import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { saveAs } from "file-saver";

import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerDoc } from "../../../../_common/model";
import {
  StructureDoc,
  StructureDocTypesAvailable,
} from "../../../../_common/model/structure-doc";
import { LoadingService } from "../../shared/services/loading.service";

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
  public attestation(usagerRef: number, typeCerfa: string): void {
    this.loadingService.startLoading();

    this.http
      .get(`${this.endPointUsagers}/attestation/${usagerRef}/${typeCerfa}`, {
        responseType: "blob",
      })
      .subscribe({
        next: (x) => {
          const newBlob = new Blob([x], { type: "application/pdf" });
          const randomNumber = Math.floor(Math.random() * 100) + 1;

          saveAs(newBlob, `${typeCerfa}_${usagerRef}_${randomNumber}.pdf`);

          setTimeout(() => {
            this.loadingService.stopLoading();
          }, 500);
        },
        error: () => {
          this.notifService.error(
            "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.loadingService.stopLoading();
        },
      });
  }

  public getDocument(usagerRef: number, index: number): Observable<Blob> {
    return this.http.get(`${this.endPoint}${usagerRef}/${index}`, {
      responseType: "blob",
    });
  }

  public deleteDocument(usagerRef: number, index: number) {
    return this.http.delete<UsagerDoc[]>(
      `${this.endPoint}${usagerRef}/${index}`
    );
  }

  // Tous les autres type de document
  public getStructureCustomDoc(usagerId: number, uuid: string) {
    return this.http.get(
      `${environment.apiUrl}usagers-structure-docs/structure/${usagerId}/${uuid}`,
      {
        responseType: "blob",
      }
    );
  }

  // Attestation postale et courrier de radiation
  public getDomifaCustomDoc(
    usagerId: number,
    docType: StructureDocTypesAvailable
  ): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}usagers-structure-docs/domifa/${usagerId}/${docType}`,
      {
        responseType: "blob",
      }
    );
  }

  // Liste des documents
  public getAllStructureDocs(): Observable<StructureDoc[]> {
    return this.http.get<StructureDoc[]>(
      environment.apiUrl + "structure-docs/"
    );
  }
}
