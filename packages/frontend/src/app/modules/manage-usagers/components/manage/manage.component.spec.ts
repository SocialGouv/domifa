import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

import { ManageUsagersComponent } from "./manage.component";

describe("ManageUsagersComponent", () => {
  let component: ManageUsagersComponent;

  let fixture: ComponentFixture<ManageUsagersComponent>;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      declarations: [ManageUsagersComponent],
      imports: [
        NgbModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUsagersComponent);
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
      searchInProcurations: true,
      searchInAyantDroits: true,
      searchString: null,
      searchStringField: "DEFAULT",
      page: 0,
      passage: null,
      sortKey: "NAME",
      sortValue: "ascending",
      statut: "VALIDE",
    });
  }));

  it("X. Small functions : get letter, reset bar, go to profil", () => {
    component.resetSearchBar();
    expect(component.filters.searchString).toEqual("");
  });
});