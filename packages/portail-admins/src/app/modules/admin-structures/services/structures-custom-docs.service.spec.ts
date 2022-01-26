import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { StructuresCustomDocsService } from "./structures-custom-docs.service";

describe("StructuresCustomDocsService", () => {
  let service: StructuresCustomDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StructuresCustomDocsService],
    });
    service = TestBed.inject(StructuresCustomDocsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
