import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { StructureService } from "./structure.service";

describe("StructureService", () => {
  let service: StructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StructureService],
    });
    service = TestBed.inject(StructureService);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
