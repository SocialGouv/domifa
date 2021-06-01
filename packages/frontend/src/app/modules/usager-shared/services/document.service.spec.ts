import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { fakeAsync, inject, TestBed } from "@angular/core/testing";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { UsagerFormModel } from "../../usagers/components/form/UsagerFormModel";
import { Doc } from "../../usagers/interfaces/doc";

import { DocumentService } from "./document.service";

describe("DocumentService", () => {
  let service: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DocumentService,
        {
          provide: MatomoInjector,
          useValue: {
            init: jest.fn(),
          },
        },
        {
          provide: MatomoTracker,
          useValue: {
            setUserId: jest.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(DocumentService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
    expect(service.endPoint).toEqual("http://localhost:3000/docs/");
  });

  it("Delete document", fakeAsync(
    inject(
      [HttpTestingController, DocumentService],
      (backend: HttpTestingController, ser: DocumentService) => {
        let response = null;
        const responseObject = new UsagerFormModel({});

        responseObject.docs = [
          new Doc({
            dateImport: new Date(),
            label: "A",
            filetype: "image/jpeg",
            importBy: "A",
          }),
          new Doc({
            dateImport: new Date(),
            label: "B",
            filetype: "applications/pdf",
            importBy: "B",
          }),
        ];

        ser.deleteDocument(2, 1).subscribe((receivedResponse: any) => {
          response = receivedResponse;
        });

        backend
          .expectOne({
            url: "http://localhost:3000/docs/2/1",
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
        const responseObject = new UsagerFormModel({});

        responseObject.docs = [
          new Doc({
            dateImport: new Date(),
            label: "A",
            filetype: "image/jpeg",
            importBy: "A",
          }),
          new Doc({
            dateImport: new Date(),
            label: "B",
            filetype: "applications/pdf",
            importBy: "B",
          }),
        ];

        ser.deleteDocument(2, 1).subscribe((receivedResponse: any) => {
          response = receivedResponse;
        });

        backend
          .expectOne({
            url: "http://localhost:3000/docs/2/1",
          })
          .flush(responseObject);
      }
    )
  ));
});
