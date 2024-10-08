import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  StructureDoc,
  StructureDocTypesAvailable,
} from "../../../../_common/model/structure-doc";
import { LoadingService } from "../../shared/services/loading.service";
import { UsagerDoc } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  public endPoint: string;
  public endPointUsagers = `${environment.apiUrl}usagers`;

  constructor(
    private readonly http: HttpClient,
    private readonly loadingService: LoadingService,
    private readonly toastService: CustomToastService
  ) {
    this.endPoint = `${environment.apiUrl}docs/`;
  }

  public upload(data: FormData, usagerRef: number) {
    const uploadURL = `${this.endPoint}${usagerRef}`;

    return this.http
      .post(uploadURL, data, {
        observe: "events",
        reportProgress: true,
      })
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  public attestation(usagerRef: number, typeCerfa: string): void {
    this.loadingService.startLoading();

    this.http
      .get(`${this.endPointUsagers}/attestation/${usagerRef}/${typeCerfa}`, {
        responseType: "blob",
      })
      .subscribe({
        next: (x: Blob) => {
          const newBlob = new Blob([x], { type: "application/pdf" });
          const randomNumber = Math.floor(Math.random() * 100) + 1;

          saveAs(newBlob, `${typeCerfa}_${usagerRef}_${randomNumber}.pdf`);

          setTimeout(() => {
            this.loadingService.stopLoading();
          }, 500);
        },
        error: () => {
          this.toastService.error(
            "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.loadingService.stopLoading();
        },
      });
  }

  public getDocument(usagerRef: number, uuid: string): Observable<Blob> {
    return this.http.get(`${this.endPoint}${usagerRef}/${uuid}`, {
      responseType: "blob",
    });
  }

  public getUsagerDocs(usagerRef: number): Observable<UsagerDoc[]> {
    return this.http.get<UsagerDoc[]>(`${this.endPoint}${usagerRef}`);
  }

  public deleteDocument(usagerRef: number, uuid: string) {
    return this.http.delete<UsagerDoc[]>(
      `${this.endPoint}${usagerRef}/${uuid}`
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
  public getDomifaCustomDoc({
    usagerId,
    docType,
    extraUrlParameters = {},
  }: {
    usagerId: number;
    docType: StructureDocTypesAvailable;
    extraUrlParameters?: { [name: string]: string };
  }): Observable<Blob> {
    return this.http.post(
      `${environment.apiUrl}usagers-structure-docs/domifa/${usagerId}/${docType}`,
      {
        ...extraUrlParameters,
      },
      {
        responseType: "blob",
      }
    );
  }

  // Liste des documents
  public getAllStructureDocs(): Observable<StructureDoc[]> {
    return this.http.get<StructureDoc[]>(
      `${environment.apiUrl}structure-docs/`
    );
  }
}
