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

    service.getAll().subscribe(
      (structures: Structure[]) => {
        console.log(structures);
        expect(structures.length).toEqual(3);
      },
      error => {
        console.log(error);
      }
    );

    service.getStructure(100).subscribe(
      (structures: Structure[]) => {
        console.log(structures);
      },
      error => {
        expect(error).toBeTruthy();
      }
    );
  }));
});
