import { APP_BASE_HREF, Location } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { global } from "@angular/compiler/src/util";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { AppComponent } from "src/app/app.component";
import { GeneralModule } from "src/app/modules/general/general.module";
import { StatsModule } from "src/app/modules/stats/stats.module";
import { StructuresModule } from "src/app/modules/structures/structures.module";
import { UsersModule } from "src/app/modules/users/users.module";
import { routes } from "../../../../../app-routing.module";
import { Usager } from "../../../interfaces/usager";
import { InteractionService } from "../../../services/interaction.service";
import { UsagerService } from "../../../services/usager.service";
import { UsagersModule } from "../../../usagers.module";
import { UsagersProfilProcurationCourrierComponent } from "./profil-procuration-courrier-component";

describe("UsagersProfilProcurationCourrierComponent", () => {
  let fixture: any;
  let app: any;
  let router: any;
  let location: Location;

  let interactionService: InteractionService;
  const spyScrollTo = jest.fn();
  beforeEach(async(() => {
    Object.defineProperty(global.window, "scroll", { value: spyScrollTo });
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        GeneralModule,
        StatsModule,
        UsersModule,
        UsagersModule,
        StructuresModule,
        NgbModule,
        UsagersModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
      ],
      providers: [
        InteractionService,
        UsagerService,
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

    interactionService = TestBed.get(InteractionService);
    router = TestBed.get(Router);
    location = TestBed.get(Location);

    fixture = TestBed.createComponent(UsagersProfilProcurationCourrierComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. Variables", async(() => {
    expect(app.labels).toBeDefined();
    expect(app.interactionsLabels).toBeDefined();
    expect(app.interactionsType).toBeDefined();

    expect(app.notifInputs).toEqual({
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
    });
  }));

  it("4. Routing functions", async(() => {
    expect(location.path()).toEqual("/404");
  }));

  it("5. Set interaction", async(() => {
    const usagerTest = new Usager();
    usagerTest.id = 2;
    interactionService
      .setInteraction(usagerTest, {
        content: "",
        nbCourrier: 10,
        type: "courrierIn",
      })
      .subscribe((usager: Usager) => {
        expect(usager.lastInteraction.courrierIn).toEqual(10);
      });
  }));
  it("6. Récupération du courrier", async(() => {
    const usagerTest = new Usager();
    usagerTest.id = 2;
    interactionService
      .setInteraction(usagerTest, "courrierOut")
      .subscribe((usager: Usager) => {
        const lastInteraction = usager.lastInteraction;
        expect(lastInteraction.courrierIn).toEqual(0);
      });
  }));
});
