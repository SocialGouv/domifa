import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Doc } from '../interfaces/document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  public http: HttpClient;
  private usager = null;
  private endPoint = environment.apiUrl+'usagers/document/';

  constructor(http: HttpClient) {
    this.http = http;
  }

  public upload(data, usagerId) {
    const uploadURL = `${this.endPoint}${usagerId}`;

    return this.http.post<any>(uploadURL, data, {
      observe: 'events',
      reportProgress: true,
    }).pipe(map((event) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
        const progress = Math.round(100 * event.loaded / event.total);
        return { status: 'progress', message: progress };
        case HttpEventType.Response:
        return { success: true, body: event.body };
        default:
        return `Unhandled event: ${event.type}`;
      }
    })
    );
  }

  /* DOCUMENT  */
  public getDocument(idUsager: number, index: number, doc: Doc) {
    this.http.get(`${this.endPoint}${idUsager}/${index}`, { responseType: 'blob' }).subscribe(x => {

      const extensionTmp = doc.filetype.split('/');
      const extension = extensionTmp[1];

      const newBlob = new Blob([x], { type: doc.filetype });

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }
      const data = window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = data;
      link.download = "document_" + idUsager+"."+extension;
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout( ( ) => {
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);
    }
    );
  }

  public deleteDocument(usagerId, index){
    return this.http.delete(`${this.endPoint}${usagerId}/${index}`);

  }
}
