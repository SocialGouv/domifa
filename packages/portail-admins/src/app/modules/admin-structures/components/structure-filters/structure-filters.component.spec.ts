import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFiltersComponent } from "./structure-filters.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { CriteriaSearchField } from "@domifa/common";
import { AdminStructuresModule } from "../../admin-structures.module";

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
      type: null,
      region: null,
      departement: null,
      usagersSegment: null,
      searchString: null,
      searchStringField: CriteriaSearchField.DEFAULT,
      page: 0,
      sortKey: "id",
      sortValue: "asc",
    };

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
