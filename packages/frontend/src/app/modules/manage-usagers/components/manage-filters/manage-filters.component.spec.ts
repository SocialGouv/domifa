import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageFiltersComponent } from "./manage-filters.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("ManageFiltersComponent", () => {
  let component: ManageFiltersComponent;
  let fixture: ComponentFixture<ManageFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageFiltersComponent],
      imports: [NgbModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFiltersComponent);
    component = fixture.componentInstance;
    component.filters = {
      echeance: null,
      interactionType: null,
      entretien: null,
      searchInProcurations: true,
      searchInAyantDroits: true,
      searchString: null,
      searchStringField: "DEFAULT",
      page: 0,
      lastInteractionDate: null,
      sortKey: "NAME",
      sortValue: "asc",
      statut: "VALIDE",
    };

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
