import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from "@angular/core";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { of } from "rxjs";

import {
  StructureFilterCriteria,
  StructureFilterCriteriaSortEnum,
} from "../../utils/structure-filter-criteria";
import { StructureAdmin } from "@domifa/common";
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";
import { uneStructureAdminMock } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { AdminStructuresModule } from "../../admin-structures.module";
import { AdminStructuresListComponent } from "./admin-structures-list.component";
import { provideHttpClient } from "@angular/common/http";
import { structuresFilter, structuresSorter } from "../../utils";

describe("AdminStructuresListComponent", () => {
  let component: AdminStructuresListComponent;
  let fixture: ComponentFixture<AdminStructuresListComponent>;
  let activatedRoute: Partial<ActivatedRoute>;
  // Mock data

  const mockApiStructures: StructureAdmin[] = [
    uneStructureAdminMock({
      id: 1,
      nom: "Structure 1",
    }),
    uneStructureAdminMock({
      id: 2,
      nom: "Structure 2",
    }),
  ];
  beforeEach(() => {
    activatedRoute = {
      data: of({
        structureList: mockApiStructures,
      }),
    };

    // Configure testing module
    TestBed.configureTestingModule({
      declarations: [AdminStructuresListComponent],
      imports: [
        AdminStructuresModule,
        RouterModule.forRoot([]),
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Create component and initialize
    fixture = TestBed.createComponent(AdminStructuresListComponent);
    component = fixture.componentInstance;

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Setup spies
    jest.spyOn(localStorage, "getItem").mockReturnValue(null);
    jest.spyOn(localStorage, "setItem");

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("component initialization", () => {
    it("should initialize with default values", () => {
      expect(component.filters).toBeDefined();
      expect(component.structures).toBeDefined();
      expect(component.filteredStructures).toBeDefined();
      expect(component.searching).toBe(false);
      expect(component.pageSize).toBe(100);
    });

    it("should retrieve structures from route data", fakeAsync(() => {
      tick();
      fixture.detectChanges();
      expect(component.totalStructures).toBe(2);
    }));

    it("should initialize filters from localStorage if available", () => {
      // Reset component
      fixture = TestBed.createComponent(AdminStructuresListComponent);
      component = fixture.componentInstance;

      // Mock localStorage with stored filters
      const storedFilters = {
        searchString: "test",
        structureType: "ccas",
        page: 2,
        sortKey: StructureFilterCriteriaSortEnum.NOM,
        sortValue: "desc",
      };

      jest
        .spyOn(localStorage, "getItem")
        .mockReturnValue(JSON.stringify(storedFilters));

      // Initialize component
      fixture.detectChanges();

      // Verify filters were loaded from localStorage
      expect(component.filters.searchString).toBe("test");
      expect(component.filters.structureType).toBe("ccas");
      expect(component.filters.page).toBe(2);
      expect(component.filters.sortKey).toBe(
        StructureFilterCriteriaSortEnum.NOM
      );
      expect(component.filters.sortValue).toBe("desc");
    });

    it("should handle localStorage errors gracefully", () => {
      // Reset component
      fixture = TestBed.createComponent(AdminStructuresListComponent);
      component = fixture.componentInstance;

      // Mock localStorage with invalid JSON
      jest.spyOn(localStorage, "getItem").mockReturnValue("invalid-json");

      // Initialize component (should not throw)
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      // Verify default filters were used
      expect(component.filters).toBeInstanceOf(StructureFilterCriteria);
    });
  });

  describe(".applyFilters()", () => {
    it("should filter structures based on criteria", () => {
      // Setup
      const mockStructures = mockApiStructures;
      const filters = new StructureFilterCriteria();
      filters.structureType = "ccas";

      // Spy on structuresFilter.filter
      jest
        .spyOn(structuresFilter, "filter")
        .mockReturnValue([mockStructures[0]]);

      // Call method
      component.applyFilters({
        filters,
        structures: mockStructures,
      });

      // Verify
      expect(structuresFilter.filter).toHaveBeenCalledWith(
        expect.arrayContaining(mockStructures),
        { criteria: filters }
      );
      expect(component.filteredStructures).toEqual([mockStructures[0]]);
      expect(component.searching).toBe(false);
    });

    it("should apply sorting after filtering", () => {
      // Setup
      const mockStructures = mockApiStructures;

      const filters = new StructureFilterCriteria();
      filters.sortKey = StructureFilterCriteriaSortEnum.NOM;
      filters.sortValue = "desc";
      component.filters$.next(filters);
      // Spy on structuresFilter.filter and structuresSorter.sortBy
      jest.spyOn(structuresFilter, "filter").mockReturnValue(mockStructures);
      jest
        .spyOn(structuresSorter, "sortBy")
        .mockReturnValue([...mockStructures].reverse());
      // Call method
      component.applyFilters({
        filters,
        structures: mockStructures,
      });
      // Verify
      expect(structuresSorter.sortBy).toHaveBeenCalledWith(mockStructures, {
        sortKey: filters.sortKey,
        sortValue: filters.sortValue,
      });
    });
  });

  describe("updateFilters method", () => {
    it("should update filters when a filter is changed", () => {
      // Spy on filters$ subject
      jest.spyOn(component.filters$, "next");

      // Call method with region filter
      component.updateFilters({
        element: "region",
        value: "11",
      });

      // Verify
      expect(component.filters.region).toBe("11");
      expect(component.filters$.next).toHaveBeenCalledWith(component.filters);
    });

    it("should reset filters when reset is called", () => {
      // Setup initial filters
      component.filters.structureType = "ccas";
      component.filters.region = "11";

      // Spy on resetSearchBar and filters$
      jest.spyOn(component, "resetSearchBar");
      jest.spyOn(component.filters$, "next");

      // Call reset
      component.updateFilters({
        element: "reset",
        value: "",
      });

      // Verify
      expect(component.resetSearchBar).toHaveBeenCalled();
      expect(component.filters$.next).toHaveBeenCalledWith(
        expect.any(StructureFilterCriteria)
      );
    });

    it("should update page when page filter is changed", () => {
      // Call method
      component.updateFilters({
        element: "page",
        value: "2",
      });

      // Verify
      expect(component.filters.page).toBe(2);
    });

    it("should update sort when sortKey filter is changed", () => {
      // Call method
      component.updateFilters({
        element: "sortKey",
        value: StructureFilterCriteriaSortEnum.NOM,
        sortValue: "desc",
      });

      // Verify
      expect(component.filters.sortKey).toBe(
        StructureFilterCriteriaSortEnum.NOM
      );
      expect(component.filters.sortValue).toBe("desc");
    });
  });

  describe("resetSearchBar method", () => {
    it("should clear search input and update filters", () => {
      // Setup
      component.searchInput = {
        nativeElement: {
          value: "test search",
          focus: jest.fn(),
        },
      } as unknown as ElementRef;

      // Spy on filters$
      jest.spyOn(component.filters$, "next");

      // Call method
      component.resetSearchBar();

      // Verify
      expect(component.searchInput.nativeElement.value).toBe("");
      expect(component.filters.searchString).toBe("");
      expect(component.filters$.next).toHaveBeenCalledWith(component.filters);
      expect(component.searchInput.nativeElement.focus).toHaveBeenCalled();
    });
  });

  describe("sortDashboard method", () => {
    it("should update sort criteria", () => {
      // Call method
      component.sortDashboard(StructureFilterCriteriaSortEnum.NOM);

      // Verify
      expect(component.filters.sortKey).toBe(
        StructureFilterCriteriaSortEnum.NOM
      );
      expect(component.filters.page).toBe(1);
    });

    it("should toggle sort direction when sorting by the same field", () => {
      // Setup - first sort ascending
      component.filters.sortKey = StructureFilterCriteriaSortEnum.NOM;
      component.filters.sortValue = "asc";

      // Call method again with same field
      component.sortDashboard(StructureFilterCriteriaSortEnum.NOM);

      // Verify direction changed
      expect(component.filters.sortValue).toBe("desc");

      // Call method again
      component.sortDashboard(StructureFilterCriteriaSortEnum.NOM);

      // Verify direction changed back
      expect(component.filters.sortValue).toBe("asc");
    });
  });

  describe("filter changes and view updates", () => {
    it("should update view when filters change", () => {
      // Setup
      const mockStructures = mockApiStructures;

      component.structures = mockStructures;

      // Spy on applyFilters
      jest.spyOn(component, "applyFilters");

      // Change filters
      component.filters.structureType = "ccas";
      component.filters$.next(component.filters);

      // Verify
      expect(component.applyFilters).toHaveBeenCalledWith({
        filters: component.filters,
        structures: expect.any(Array),
      });
    });
  });
});
