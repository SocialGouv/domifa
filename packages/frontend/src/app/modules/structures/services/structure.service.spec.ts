import { HttpClientModule } from "@angular/common/http";
import { async, TestBed } from "@angular/core/testing";
import { Structure } from "../structure.interface";
import { StructureService } from "./structure.service";

describe("StructureService", () => {
  let service: StructureService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [StructureService]
    });
    service = TestBed.get(StructureService);
  });

  it("0. creation", async(() => {
    expect(service).toBeTruthy();
  }));

  it("1. getStructure & getAll", async(() => {
    service.getAll().subscribe((structures: Structure[]) => {
      expect(structures.length).toEqual(1);
    });

    service.getStructure(1).subscribe((structure: Structure) => {
      expect(structure.structureType).toEqual("ccas");
    });
  }));
});
