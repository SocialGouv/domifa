import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot } from "@angular/router";
import { StructureService } from "../modules/structures/services/structure.service";
import { StructureGuard } from "./structure-guard";

describe("StructureGuard", () => {
  let service: StructureGuard;

  beforeEach(() => {
    const structureServiceStub = () => ({
      findOne: (id: number) => ({ pipe: () => ({}) }),
    });
    TestBed.configureTestingModule({
      providers: [
        StructureGuard,
        { provide: StructureService, useFactory: structureServiceStub },
      ],
    });
    service = TestBed.inject(StructureGuard);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
