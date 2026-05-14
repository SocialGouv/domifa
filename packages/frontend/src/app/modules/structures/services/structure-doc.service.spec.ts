import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { StructureDocService } from "./structure-doc.service";

describe("StructureDocService", () => {
  let service: StructureDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StructureDocService,
      ],
    });
    service = TestBed.inject(StructureDocService);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
