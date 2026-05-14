import { TestBed } from "@angular/core/testing";

import { StructureInformationService } from "./structure-information.service";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("StructureInformationService", () => {
  let service: StructureInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StructureInformationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
