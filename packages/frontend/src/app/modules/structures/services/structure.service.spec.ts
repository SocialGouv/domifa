import { HttpClientModule } from "@angular/common/http";
import { async, TestBed } from "@angular/core/testing";
import { Structure } from "../structure.interface";
import { StructureService } from "./structure.service";

describe("StructureService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [StructureService]
    });
  });

  it("should be created", async(() => {
    const service: StructureService = TestBed.get(StructureService);
    expect(service).toBeTruthy();

    service.getAll().subscribe((structures: Structure[]) => {
      expect(structures.length).toEqual(1);
    });

    service.getStructure(100).subscribe(
      (structures: Structure[]) => {
        expect(structures).toBeTruthy();
      },
      error => {
        expect(error).toBeTruthy();
      }
    );
  }));
});
