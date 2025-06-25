import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFiltersComponent } from "./structure-filters.component";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";

import {
  CriteriaSearchField,
  DEPARTEMENTS_LISTE,
  REGIONS_DEF,
} from "@domifa/common";
import { AdminStructuresModule } from "../../admin-structures.module";
import { StructureFilterCriteriaSortEnum } from "../../utils/structure-filter-criteria";

describe("StructureFiltersComponent", () => {
  let component: StructureFiltersComponent;
  let fixture: ComponentFixture<StructureFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStructuresModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureFiltersComponent);
    component = fixture.componentInstance;
    component.filters = {
      reset: null,
      structureType: null,
      region: null,
      departement: null,
      domicilieSegment: null,
      searchString: null,
      searchStringField: CriteriaSearchField.DEFAULT,
      page: 0,
      sortKey: StructureFilterCriteriaSortEnum.ID,
      sortValue: "asc",
    };
    component.searching = false;
    component.nbResults = 10;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("component initialization", () => {
    it("should initialize with default values", () => {
      expect(component.DEPARTEMENTS_LISTE).toEqual(
        expect.objectContaining(DEPARTEMENTS_LISTE)
      );
      expect(component.filters).toBeDefined();
      expect(component.structureTypeOptions).toBeDefined();
      expect(component.segmentUsagersOptions).toBeDefined();
      expect(component.REGIONS_LISTE).toBeDefined();
      expect(component.subscription).toBeDefined();
    });
  });

  describe(".getDepartmentsWithFilter()", () => {
    it("should return all departments when no region is provided", () => {
      const result = component.getDepartmentsWithFilter(null);
      expect(result).toEqual(expect.objectContaining(DEPARTEMENTS_LISTE));
    });

    it("should return all departments when undefined region is provided", () => {
      const result = component.getDepartmentsWithFilter(undefined);
      expect(result).toEqual(expect.objectContaining(DEPARTEMENTS_LISTE));
    });

    it("should return filtered departments when a valid region is provided", () => {
      // Using Île-de-France (code 11) as an example
      const result = component.getDepartmentsWithFilter("11");

      // Île-de-France has 8 departments
      const ileDefranceDepartments = REGIONS_DEF.find(
        (r) => r.regionCode === "11"
      ).departements;

      // Check that the result has the correct number of departments
      expect(Object.keys(result).length).toBe(ileDefranceDepartments.length);

      // Check that all departments in the result belong to Île-de-France
      ileDefranceDepartments.forEach((dep) => {
        expect(result[dep.departmentCode]).toBe(dep.departmentName);
      });
    });

    it("should return an undefined when an invalid region is provided", () => {
      const result = component.getDepartmentsWithFilter("invalid-region");
      expect(result).toEqual(undefined);
    });
  });

  describe("ngOnChanges", () => {
    it("should update DEPARTEMENTS_LISTE when region filter changes", () => {
      // Spy on getDepartmentsWithFilter method
      jest.spyOn(component, "getDepartmentsWithFilter");

      // Create a SimpleChanges object with region change
      const changes: SimpleChanges = {
        filters: new SimpleChange(
          { ...component.filters, region: null },
          { ...component.filters, region: "11" },
          false
        ),
      };

      // Call ngOnChanges
      component.ngOnChanges(changes);

      // Verify getDepartmentsWithFilter was called with the new region
      expect(component.getDepartmentsWithFilter).toHaveBeenCalledWith("11");

      // Verify DEPARTEMENTS_LISTE was updated
      const ileDefranceDepartments = REGIONS_DEF.find(
        (r) => r.regionCode === "11"
      ).departements;
      expect(Object.keys(component.DEPARTEMENTS_LISTE).length).toBe(
        ileDefranceDepartments.length
      );
    });

    it("should not update DEPARTEMENTS_LISTE when other filters change", () => {
      // Spy on getDepartmentsWithFilter method
      jest.spyOn(component, "getDepartmentsWithFilter");

      // Create a SimpleChanges object with a non-region change
      const changes: SimpleChanges = {
        filters: new SimpleChange(
          { ...component.filters, structureType: null },
          { ...component.filters, structureType: "CCAS" },
          false
        ),
      };

      // Call ngOnChanges
      component.ngOnChanges(changes);

      // Verify getDepartmentsWithFilter was not called
      expect(component.getDepartmentsWithFilter).not.toHaveBeenCalled();
    });
  });

  describe("filter changes and view updates", () => {
    it("should emit updateFilters event when a filter button is clicked", () => {
      // Spy on the updateFilters EventEmitter
      jest.spyOn(component.updateFilters, "emit");

      // Create a test element to simulate a button click
      const button = document.createElement("button");
      button.addEventListener("click", () => {
        component.updateFilters.emit({ element: "region", value: "11" });
      });

      // Trigger the click
      button.click();

      // Verify the event was emitted with the correct parameters
      expect(component.updateFilters.emit).toHaveBeenCalledWith({
        element: "region",
        value: "11",
      });
    });
  });
});
