import { TestBed } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { Doc } from "../interfaces/document";
import { DocumentService } from "./document.service";

describe("DocumentService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [DocumentService]
    });
  });

  it("should be created", () => {
    const service: DocumentService = TestBed.get(DocumentService);
    expect(service).toBeTruthy();
    expect(service.endPoint).toEqual("http://localhost:3000/usagers/document/");

    const doc = new Doc({});
    expect(doc).toBeDefined();
  });
});
