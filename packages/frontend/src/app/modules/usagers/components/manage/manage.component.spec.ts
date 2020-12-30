import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ManageUsagersComponent } from "./manage.component";
import { global } from "@angular/compiler/src/util";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ToastrModule } from "ngx-toastr";

describe("ManageUsagersComponent", () => {
  let component: ManageUsagersComponent;

  let fixture: ComponentFixture<ManageUsagersComponent>;

  const spyScrollTo = jest.fn();

  beforeAll(async () => {
    Object.defineProperty(global.window, "scroll", { value: spyScrollTo });

    TestBed.configureTestingModule({
      declarations: [ManageUsagersComponent],
      imports: [
        NgbModule,
        MatomoModule,
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
      ],
      providers: [
        {
          provide: MatomoInjector,
          useValue: {
            init: jest.fn(),
          },
        },
        {
          provide: MatomoTracker,
          useValue: {
            setUserId: jest.fn(),
          },
        },
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUsagersComponent);
    component = fixture.debugElement.componentInstance;
  });

  it("0. create component", () => {
    expect(component).toBeTruthy();
  });

  it("1. NgOnInit", () => {
    expect(component.searching).toEqual(true);
    expect(component.filters).toEqual({
      echeance: null,
      interactionType: null,
      name: null,
      page: 0,
      passage: null,
      sortKey: "NAME",
      sortValue: "ascending",
      statut: "VALIDE",
    });
  });

  it("3. Reset Filters", async(() => {
    component.resetFilters();

    expect(component.filters).toEqual({
      echeance: null,
      interactionType: null,
      name: null,
      page: 0,
      passage: null,
      sortKey: "NAME",
      sortValue: "ascending",
      statut: "VALIDE",
    });
  }));

  it("X. Small functions : get letter, reset bar, go to profil", () => {
    component.resetSearchBar();
    expect(component.filters.name).toEqual("");
  });
});
