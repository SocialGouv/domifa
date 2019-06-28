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
import { RegisterUserComponent } from "src/app/modules/users/components/register-user/register-user.component";
import { routes } from "../../../../app-routing.module";
import { UsagersFormComponent } from "../form/usagers-form";
import { ManageUsagersComponent } from "../manage/manage.component";
import { UsagersProfilComponent } from "./profil-component";

describe("UsagersProfilComponent", () => {
  let fixture: any;
  let app: any;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HomeComponent,
        UsagersFormComponent,
        ManageUsagersComponent,
        UsagersProfilComponent,
        StructuresFormComponent,
        LoadingComponent,
        RegisterUserComponent,
        MentionsLegalesComponent,
        NotFoundComponent
      ],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UsagersProfilComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. Variables", () => {
    expect(app.title).toBeDefined();
    expect(app.labels).toBeDefined();
    expect(app.messages).toBeDefined();
    expect(app.notifLabels).toBeDefined();

    expect(app.notifInputs).toEqual({
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0
    });

    expect(app.callToday).toBeFalsy();
    expect(app.visitToday).toBeFalsy();
  });
  it("2. General functions", () => {
    expect(app.isToday(new Date("march 30, 2019"))).toBeFalsy();
  });

  it("4. Routing functions", fakeAsync(
    inject([Router, Location], (router: Router, location: Location) => {
      app.ngOnInit();
      expect(location.path()).toEqual("/404");
    })
  ));
});
