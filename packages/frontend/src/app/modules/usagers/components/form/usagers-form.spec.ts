import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LABELS } from "src/app/shared/labels";
import { UsagersFormComponent } from "./usagers-form";

describe("UsagersFormComponent", () => {
  let app: any;
  let fixture: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersFormComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterModule.forRoot([])
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

  it("X. General functions", () => {
    app.usager.decision.statut = "instruction";
    app.changeStep(4);
    expect(app.usager.etapeDemande).toEqual(0);
    app.usager.id = 12;
    app.changeStep(3);
    expect(app.usager.etapeDemande).toEqual(3);
    app.setValueRdv("oui");
    expect(app.rdvForm.get("isNow").value).toEqual("oui");
  });
});
