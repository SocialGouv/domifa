import { HttpEvent, HttpEventType } from "@angular/common/http";
import { fakeAsync, inject, TestBed, tick } from "@angular/core/testing";

import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { Doc } from "../interfaces/document";
import { Usager } from "../interfaces/usager";
import { DocumentService } from "./document.service";
describe("DocumentService", () => {
  let service: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService]
    });
    service = TestBed.get(DocumentService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
    expect(service.endPoint).toEqual("http://localhost:3000/usagers/document/");
  });

  it("Delete document", fakeAsync(
    inject(
      [HttpTestingController, DocumentService],
      (backend: HttpTestingController, ser: DocumentService) => {
        let response = null;
        const responseObject = new Usager({});

        responseObject.docs = [
          new Doc({
            dateImport: new Date(),
            documentName: "A",
            filetype: "image/jpeg",
            importBy: "A"
          }),
          new Doc({
            dateImport: new Date(),
            documentName: "B",
            filetype: "applications/pdf",
            importBy: "B"
          })
        ];

        ser.deleteDocument(2, 1).subscribe(
          (receivedResponse: any) => {
            response = receivedResponse;
          },
          (error: any) => {}
        );

        backend
          .expectOne({
            url: "http://localhost:3000/usagers/document/2/1"
          })
          .flush(responseObject);
      }
    )
  ));

  it("should get users", fakeAsync(
    inject(
      [HttpTestingController, DocumentService],
      (backend: HttpTestingController, ser: DocumentService) => {
        let response = null;
        const responseObject = new Usager({});

        responseObject.docs = [
          new Doc({
            dateImport: new Date(),
            documentName: "A",
            filetype: "image/jpeg",
            importBy: "A"
          }),
          new Doc({
            dateImport: new Date(),
            documentName: "B",
            filetype: "applications/pdf",
            importBy: "B"
          })
        ];

        ser.deleteDocument(2, 1).subscribe(
          (receivedResponse: any) => {
            response = receivedResponse;
          },
          (error: any) => {}
        );

        backend
          .expectOne({
            url: "http://localhost:3000/usagers/document/2/1"
          })
          .flush(responseObject);
      }
    )
  ));
});
