import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, fakeAsync, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { routes } from "src/app/app-routing.module";
import { AppComponent } from "src/app/app.component";
import { NotFoundComponent } from "src/app/modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "src/app/modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "src/app/modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { LoadingComponent } from "src/app/modules/loading/loading.component";
import { StructuresFormComponent } from "src/app/modules/structures/components/structures-form/structures-form.component";
import { RegisterUserComponent } from "src/app/modules/users/components/register-user/register-user.component";
import { LABELS } from "src/app/shared/labels";
import { ManageUsagersComponent } from "../manage/manage.component";
import { UsagersProfilComponent } from "../profil/profil-component";
import { UsagersFormComponent } from "./usagers-form";

describe("UsagersFormComponent", () => {
  let app: any;
  let fixture: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UsagersFormComponent,
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
        RouterTestingModule.withRoutes(routes),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(UsagersFormComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  }));

  it("0. Création du compenent", () => {
    expect(app).toBeTruthy();
  });

  it("1. Initialisation des variables", () => {
    expect(app.title).toEqual("Enregister une domiciliation");
    expect(app.uploadResponse).toEqual({
      filePath: "",
      message: "",
      status: ""
    });

    expect(app.userId).toEqual(1);
    expect(app.structureId).toEqual(2);
    expect(app.uploadError).toEqual({});
    expect(app.labels).toEqual(LABELS);
    expect(app.doublons).toEqual([]);
    expect(app.documents).toEqual([]);

    expect(app.motifsRefus).toBeDefined();
    expect(app.residence).toBeDefined();
    expect(app.cause).toBeDefined();
    expect(app.raison).toBeDefined();

    expect(Array.isArray(app.motifsRefusList)).toBeTruthy();
    expect(Array.isArray(app.residenceList)).toBeTruthy();
    expect(Array.isArray(app.causeList)).toBeTruthy();
    expect(Array.isArray(app.raisonList)).toBeTruthy();
  });

  it("2. Initialisation de l'usager", () => {
    expect(app.usager).toBeTruthy();
    expect(app.usager.entretien).toBeTruthy();
    expect(app.usager.lastInteraction).toBeTruthy();
  });

  it("6. Valid form", () => {
    app.usagerForm.controls.nom.setValue("Test nom");
    app.usagerForm.controls.prenom.setValue("Test Prenom");
    app.usagerForm.controls.surnom.setValue("Test Surnom");
    app.usagerForm.controls.dateNaissance.setValue("20/12/1991");
    app.usagerForm.controls.villeNaissance.setValue("Paris");
    expect(app.usagerForm.valid).toBeTruthy();
  });

  it("3. Ayant-droit", () => {
    app.resetAyantDroit();
    expect(app.usagerForm.controls.ayantsDroits.controls).toEqual([]);

    app.addAyantDroit();
    app.addAyantDroit();
    app.addAyantDroit();
    app.deleteAyantDroit();
    expect(app.usagerForm.controls.ayantsDroits.controls.length).toEqual(2);
  });

  it("X. General functions", async(() => {
    app.usager.decision.statut = "instruction";
    app.changeStep(4);
    expect(app.usager.etapeDemande).toEqual(0);
    app.usager.id = 12;
    app.changeStep(3);
    expect(app.usager.etapeDemande).toEqual(3);
    app.setValueRdv("oui");
    expect(app.rdvForm.get("isNow").value).toEqual("oui");

    app.initForm();
  }));
});
