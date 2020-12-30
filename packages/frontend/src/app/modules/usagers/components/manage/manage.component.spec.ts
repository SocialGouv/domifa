import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";

import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { GeneralModule } from "src/app/modules/general/general.module";
import { StatsModule } from "src/app/modules/stats/stats.module";
import { StructuresModule } from "src/app/modules/structures/structures.module";
import { UsersModule } from "src/app/modules/users/users.module";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { routes } from "../../../../app-routing.module";
import { UsagerService } from "../../services/usager.service";
import { UsagersModule } from "../../usagers.module";
import { ManageUsagersComponent } from "./manage.component";
import { global } from "@angular/compiler/src/util";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("ManageUsagersComponent", () => {
  let app: ManageUsagersComponent;
  let fixture: any;
  let authService: AuthService;

  const spyScrollTo = jest.fn();
  beforeAll(async () => {
    Object.defineProperty(global.window, "scroll", { value: spyScrollTo });
    TestBed.configureTestingModule({
      declarations: [ManageUsagersComponent],
      imports: [
        GeneralModule,
        NgbModule,
        RouterTestingModule,
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

    authService = TestBed.get(AuthService);

    fixture = TestBed.createComponent(ManageUsagersComponent);
    app = fixture.debugElement.componentInstance;
  });

  it("0. create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. NgOnInit", () => {
    expect(app.searching).toEqual(true);
    expect(app.filters).toEqual({
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
    app.resetFilters();

    expect(app.filters).toEqual({
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
    app.resetSearchBar();
    expect(app.filters.name).toEqual("");
  });
});
