import { APP_BASE_HREF, Location } from "@angular/common";
import { async, fakeAsync, inject, TestBed, tick } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";
import { NotFoundComponent } from "src/app/modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "src/app/modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "src/app/modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { LoadingComponent } from "src/app/modules/loading/loading.component";
import { StructuresFormComponent } from "src/app/modules/structures/components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "src/app/modules/structures/components/structures-search/structures-search.component";
import { RegisterUserComponent } from "src/app/modules/users/components/register-user/register-user.component";
import { UserProfilComponent } from "src/app/modules/users/components/user-profil/user-profil.component";
import { routes } from "../../../../app-routing.module";
import { StructuresConfirmComponent } from "../../../structures/components/structures-confirm/structures-confirm.component";
import { LoginComponent } from "../../../users/components/login/login.component";
import { ResetPasswordComponent } from "../../../users/components/reset-password/reset-password.component";
import { LastInteraction } from "../../interfaces/last-interaction";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";
import { UsagersModule } from "../../usagers.module";
import { UsagersFormComponent } from "../form/usagers-form";
import { ImportComponent } from "../import/import.component";
import { ManageUsagersComponent } from "../manage/manage.component";
import { UsagersProfilComponent } from "./profil-component";

describe("UsagersProfilComponent", () => {
  let fixture: any;
  let app: any;
  let router: any;
  let location: Location;
  let usagerService: UsagerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        StructuresFormComponent,
        LoadingComponent,
        RegisterUserComponent,
        MentionsLegalesComponent,
        NotFoundComponent,
        StructuresSearchComponent,
        StructuresConfirmComponent,
        ResetPasswordComponent,
        UserProfilComponent
      ],
      imports: [
        UsagersModule,
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

    usagerService = TestBed.get(UsagerService);
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
    expect(app.messages).toBeDefined();
    expect(app.interactionsType).toBeDefined();

    expect(app.notifInputs).toEqual({
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0
    });

    expect(app.callToday).toBeFalsy();
    expect(app.visitToday).toBeFalsy();
  }));

  it("2. General functions", async(() => {
    expect(app.isToday(new Date("march 30, 2019"))).toBeFalsy();
  }));

  it("4. Routing functions", async(() => {
    expect(location.path()).toEqual("/404");
  }));

  it("5. Set interaction", async(() => {
    usagerService
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
    usagerService.setPassage(2, "courrierOut").subscribe((usager: Usager) => {
      const lastInteraction = new LastInteraction(usager.lastInteraction);
      const today = new Date().getDate();
      expect(lastInteraction.courrierOut).toEqual(0);
      expect(lastInteraction.courrierOut.getDate()).toEqual(today);
    });
  }));
});
