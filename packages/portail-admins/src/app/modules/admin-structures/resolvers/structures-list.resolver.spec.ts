import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { structuresListResolver } from "./structures-list.resolver";
import { AdminStructuresApiClient } from "../../shared/services";
import { structuresCache } from "../../shared/store";
import { structuresListModelBuilder } from "../utils";
import { provideHttpClient } from "@angular/common/http";
import { uneStructureAdminMock } from "../../../mocks/STRUCTURE_MOCK.mock";
import { DomiciliesSegmentEnum, StructureAdmin } from "@domifa/common";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("structuresListResolver", () => {
  let adminStructuresApiClient: jest.Mocked<AdminStructuresApiClient>;

  const mockApiStructures: StructureAdmin[] = [
    uneStructureAdminMock({
      id: 1,
      nom: "Structure 1",
      domicilieSegment: DomiciliesSegmentEnum.SMALL,
    }),
    uneStructureAdminMock({
      id: 2,
      nom: "Structure 2",
      domicilieSegment: DomiciliesSegmentEnum.VERY_SMALL,
    }),
  ];

  const mockProcessedStructures: StructureAdmin[] = [...mockApiStructures];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), AdminStructuresApiClient],
    });

    adminStructuresApiClient = TestBed.inject(
      AdminStructuresApiClient
    ) as jest.Mocked<AdminStructuresApiClient>;

    // Mock the API client method
    adminStructuresApiClient.getAdminStructureListData = jest
      .fn()
      .mockReturnValue(of(mockApiStructures));

    // Mock the structuresListModelBuilder
    jest
      .spyOn(structuresListModelBuilder, "buildStructuresViewModel")
      .mockReturnValue(mockProcessedStructures);

    // Clear cache before each test
    structuresCache.setStructureListData(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data from API when cache is empty", (done) => {
    const result$ = TestBed.runInInjectionContext(() =>
      structuresListResolver(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    ) as Observable<StructureAdmin[]>;

    result$.subscribe((data: StructureAdmin[]) => {
      expect(
        adminStructuresApiClient.getAdminStructureListData
      ).toHaveBeenCalled();
      expect(
        structuresListModelBuilder.buildStructuresViewModel
      ).toHaveBeenCalledWith(mockApiStructures);
      expect(data).toEqual(mockProcessedStructures);
      done();
    });
  });

  it("should update cache after fetching data from API", (done) => {
    const result$ = TestBed.runInInjectionContext(() =>
      structuresListResolver(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    ) as Observable<StructureAdmin[]>;

    result$.subscribe(() => {
      expect(structuresCache.getStructureListData()).toEqual(
        mockProcessedStructures
      );
      done();
    });
  });

  it("should return cached data when cache is populated", (done) => {
    // Populate cache
    structuresCache.setStructureListData(mockProcessedStructures);

    const result$ = TestBed.runInInjectionContext(() =>
      structuresListResolver(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    ) as Observable<StructureAdmin[]>;

    result$.subscribe((data: StructureAdmin[]) => {
      expect(
        adminStructuresApiClient.getAdminStructureListData
      ).not.toHaveBeenCalled();
      expect(
        structuresListModelBuilder.buildStructuresViewModel
      ).not.toHaveBeenCalled();
      expect(data).toEqual(mockProcessedStructures);
      done();
    });
  });

  it("should fetch data from API when cache is empty array", (done) => {
    // Set cache to empty array
    structuresCache.setStructureListData([]);

    const result$ = TestBed.runInInjectionContext(() =>
      structuresListResolver(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    ) as Observable<StructureAdmin[]>;

    result$.subscribe((data: StructureAdmin[]) => {
      expect(
        adminStructuresApiClient.getAdminStructureListData
      ).toHaveBeenCalled();
      expect(
        structuresListModelBuilder.buildStructuresViewModel
      ).toHaveBeenCalledWith(mockApiStructures);
      expect(data).toEqual(mockProcessedStructures);
      done();
    });
  });
});
