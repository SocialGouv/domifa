import { TestBed } from "@angular/core/testing";

import { StructureInformationService } from "./structure-information.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("StructureInformationService", () => {
  let service: StructureInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(StructureInformationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
