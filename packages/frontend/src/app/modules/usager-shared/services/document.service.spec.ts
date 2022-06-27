import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

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
});
