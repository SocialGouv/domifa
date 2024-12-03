import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";

import { ManageUsagersPageComponent } from "./manage-usagers-page.component";
import { StoreModule } from "@ngrx/store";

describe("ManageUsagersPageComponent", () => {
  let component: ManageUsagersPageComponent;

  let fixture: ComponentFixture<ManageUsagersPageComponent>;

  beforeAll(() => {
    TestBed.configureTestingModule({
      declarations: [ManageUsagersPageComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        ...MATOMO_INJECTORS,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUsagersPageComponent);
    component = fixture.debugElement.componentInstance;
  });

  it("0. create component", () => {
    expect(component).toBeTruthy();
  });

  it("3. Reset Filters", waitForAsync(() => {
    component.resetFilters();

    expect(component.filters).toEqual({
      echeance: null,
      interactionType: null,
      entretien: null,
      searchString: null,
      searchStringField: "DEFAULT",
      page: 1,
      lastInteractionDate: null,
      sortKey: "NOM",
      sortValue: "asc",
      statut: "VALIDE",
    });
  }));

  it("X. Small functions : get letter, reset bar, go to profil", () => {
    component.resetSearchBar();
    expect(component.filters.searchString).toEqual(null);
  });
});
