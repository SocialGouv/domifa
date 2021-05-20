import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { global } from "@angular/compiler/src/util";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { ManageUsagersComponent } from "./manage.component";

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
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
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

  it(
    "3. Reset Filters",
    waitForAsync(() => {
      component.resetFilters();

      expect(component.filters).toEqual({
        echeance: null,
        interactionType: null,
        searchString: null,
        page: 0,
        passage: null,
        sortKey: "NAME",
        sortValue: "ascending",
        statut: "VALIDE",
        searchInAyantDroits: true,
      });
    })
  );

  it("X. Small functions : get letter, reset bar, go to profil", () => {
    component.resetSearchBar();
    expect(component.filters.searchString).toEqual("");
  });
});
