import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { structureResolver } from "./structure.resolver";
import { structuresCache } from "../../shared/store";
import { uneStructureAdminMock } from "../../../mocks/STRUCTURE_MOCK.mock";
import { DomiciliesSegmentEnum, StructureAdmin } from "@domifa/common";

describe("structureResolver", () => {
  const mockStructure: StructureAdmin = uneStructureAdminMock({
    id: 123,
    nom: "Test Structure",
    domicilieSegment: DomiciliesSegmentEnum.SMALL,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return structure from cache when it exists", () => {
    const route = {
      params: { structureId: "123" },
    } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;

    jest
      .spyOn(structuresCache, "getStructureById")
      .mockReturnValue(mockStructure);

    const result = TestBed.runInInjectionContext(() =>
      structureResolver(route, {} as RouterStateSnapshot)
    );

    expect(structuresCache.getStructureById).toHaveBeenCalledWith(123);
    expect(result).toEqual(mockStructure);
  });

  it("should return undefined when structure does not exist in cache", () => {
    const route = {
      params: { structureId: "999" },
    } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;

    jest.spyOn(structuresCache, "getStructureById").mockReturnValue(undefined);

    const result = TestBed.runInInjectionContext(() =>
      structureResolver(route, {} as RouterStateSnapshot)
    );

    expect(structuresCache.getStructureById).toHaveBeenCalledWith(999);
    expect(result).toBeUndefined();
  });

  it("should parse structureId from route params as integer", () => {
    const route = {
      params: { structureId: "456" },
    } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;

    jest
      .spyOn(structuresCache, "getStructureById")
      .mockReturnValue(mockStructure);

    TestBed.runInInjectionContext(() =>
      structureResolver(route, {} as RouterStateSnapshot)
    );

    expect(structuresCache.getStructureById).toHaveBeenCalledWith(456);
  });
});
