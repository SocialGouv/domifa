import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";

import { first } from "rxjs/operators";
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
  let app: any;
  let fixture: any;
  let authService: AuthService;

  const spyScrollTo = jest.fn();
  beforeAll(async (done) => {
    Object.defineProperty(global.window, "scroll", { value: spyScrollTo });
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        StatsModule,
        StructuresModule,
        GeneralModule,
        UsersModule,
        UsagersModule,
        NgbModule,
        RouterModule.forRoot([]),
        RouterTestingModule.withRoutes(routes),
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
      ],
      providers: [
        UsagerService,
        AuthService,
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
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: ServerErrorInterceptor,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    authService = TestBed.get(AuthService);

    fixture = TestBed.createComponent(ManageUsagersComponent);
    app = fixture.debugElement.componentInstance;

    authService
      .login("ccastest@yopmail.com", "Azerty012345")
      .pipe(first())
      .subscribe(
        (user) => {
          app.ngOnInit();
          done();
        },
        (error) => {
          done();
        }
      );
  });

  it("0. create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. NgOnInit", () => {
    app.ngOnInit();
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
