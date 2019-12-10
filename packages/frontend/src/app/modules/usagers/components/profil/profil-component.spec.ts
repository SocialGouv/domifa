import { APP_BASE_HREF, Location } from "@angular/common";
import { async, TestBed } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";
import { GeneralModule } from "src/app/modules/general/general.module";
import { StatsModule } from "src/app/modules/stats/stats.module";
import { StructuresModule } from "src/app/modules/structures/structures.module";
import { UsersModule } from "src/app/modules/users/users.module";
import { routes } from "../../../../app-routing.module";
import { Usager } from "../../interfaces/usager";
import { InteractionService } from "../../services/interaction.service";
import { UsagerService } from "../../services/usager.service";
import { UsagersModule } from "../../usagers.module";
import { UsagersProfilComponent } from "./profil-component";

describe("UsagersProfilComponent", () => {
  let fixture: any;
  let app: any;
  let router: any;
  let location: Location;

  let interactionService: InteractionService;

  beforeEach(async(() => {
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
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [UsagerService, { provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UsagersProfilComponent);
    fixture.detectChanges();

    interactionService = TestBed.get(InteractionService);
    router = TestBed.get(Router);
    location = TestBed.get(Location);

    fixture.ngZone.run(() => {
      router.initialNavigation();
    });

    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. Variables", async(() => {
    expect(app.title).toBeDefined();
    expect(app.labels).toBeDefined();
    expect(app.notifs).toBeDefined();
    expect(app.interactionsLabels).toBeDefined();
    expect(app.interactionsType).toBeDefined();

    expect(app.notifInputs).toEqual({
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0
    });
  }));

  it("4. Routing functions", async(() => {
    expect(location.path()).toEqual("/404");
  }));

  it("5. Set interaction", async(() => {
    interactionService
      .setInteraction(2, {
        content: "",
        nbCourrier: 10,
        type: "courrierIn"
      })
      .subscribe((usager: Usager) => {
        expect(usager.lastInteraction.nbCourrier).toEqual(10);
      });
  }));
  it("6. Récupération du courrier", async(() => {
    interactionService
      .setPassage(2, "courrierOut")
      .subscribe((usager: Usager) => {
        const lastInteraction = usager.lastInteraction;
        expect(lastInteraction.nbCourrier).toEqual(0);
      });
  }));
});
