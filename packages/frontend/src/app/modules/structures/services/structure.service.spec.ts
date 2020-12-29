import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DepartementHelper } from "./departement-helper.service";
import { StructureService } from "./structure.service";

describe("StructureService", () => {
  let service: StructureService;

  beforeEach(() => {
    const departementHelperStub = () => ({
      getDepartementFromCodePostal: (postalCode) => ({}),
      getRegionCodeFromDepartement: (departement) => ({}),
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StructureService,
        { provide: DepartementHelper, useFactory: departementHelperStub },
      ],
    });
    service = TestBed.inject(StructureService);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
