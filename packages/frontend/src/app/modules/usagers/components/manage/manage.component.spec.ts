import { APP_BASE_HREF, Location } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, fakeAsync, inject, TestBed, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";
import { AppModule } from "src/app/app.module";
import { NotFoundComponent } from "src/app/modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "src/app/modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "src/app/modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { LoadingComponent } from "src/app/modules/loading/loading.component";
import { StructuresFormComponent } from "src/app/modules/structures/components/structures-form/structures-form.component";
import { RegisterUserComponent } from "src/app/modules/users/components/register-user/register-user.component";
import { AppRoutingModule, routes } from "../../../../app-routing.module";
import { UsagersFormComponent } from "../form/usagers-form";
import { UsagersProfilComponent } from "../profil/profil-component";
import { ManageUsagersComponent } from "./manage.component";

describe("ManageUsagersComponent", () => {
  let app: any;
  let fixture: any;

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
        RouterTestingModule.withRoutes(routes),
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUsagersComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  }));

  it("0. create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. NgOnInit", async(() => {
    expect(app.title).toEqual("Gérer vos domiciliés");
    expect(app.searching).toEqual(false);

    expect(app.filters).toEqual({
      echeance: null,
      id: null,
      interactionStatut: null,
      interactionType: null,
      name: null,
      sort: "az",
      statut: "valide"
    });
  }));

  it("2. Update filter", async(() => {
    app.updateFilters("sort", "za");
    app.updateFilters("statut", "refus");
    expect(app.filters).toEqual({
      echeance: null,
      id: null,
      interactionStatut: null,
      interactionType: null,
      name: null,
      sort: "za",
      statut: "refus"
    });
  }));

  it("3. Reset Filters", async(() => {
    fixture = TestBed.createComponent(ManageUsagersComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
    app.resetFilters();
    expect(app.filters).toEqual({
      echeance: null,
      id: null,
      interactionStatut: null,
      interactionType: null,
      name: null,
      sort: "az",
      statut: "valide"
    });
  }));

  it("X. Small functions : get letter, reset bar, go to profil", () => {
    fixture = TestBed.createComponent(ManageUsagersComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
    expect(app.getLetter("Yassine")).toEqual("Y");
    app.resetSearchBar();
    expect(app.filters.name).toEqual("");
  });

  it("4. Routing functions", fakeAsync(
    inject([Router, Location], (router: Router, location: Location) => {
      app = fixture.debugElement.componentInstance;
      app.goToProfil(2, "instruction");
      tick();
      expect(location.path()).toEqual("/profil/2/edit");

      app.goToProfil(1, "valide");
      tick();
      expect(location.path()).toEqual("/profil/1");
    })
  ));
});
