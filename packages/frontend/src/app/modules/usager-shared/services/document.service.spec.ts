import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../_common/mocks";

import { DocumentService } from "./document.service";

describe("DocumentService", () => {
  let service: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
      ],
      providers: [DocumentService],
    });
    service = TestBed.inject(DocumentService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
    expect(service.endPoint).toEqual("http://localhost:3000/docs/");
  });
});
