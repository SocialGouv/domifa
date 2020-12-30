import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { StructureDocService } from "./structure-doc.service";

describe("StructureDocService", () => {
  let service: StructureDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StructureDocService],
    });
    service = TestBed.inject(StructureDocService);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
