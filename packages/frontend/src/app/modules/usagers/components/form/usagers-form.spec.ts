import { async, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LABELS } from "src/app/shared/labels";
import { UsagersFormComponent } from "./usagers-form";

describe("UsagersFormComponent", () => {
  let app, fixture;

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
  }));

  it("0. Création du compenent", () => {
    fixture = TestBed.createComponent(UsagersFormComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
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
  });

  it("2. Valid form", () => {
    app.usagerForm.controls.nom.setValue("Test nom");
    app.usagerForm.controls.prenom.setValue("Test Prenom");
    app.usagerForm.controls.surnom.setValue("Test Surnom");
    app.usagerForm.controls.dateNaissance.setValue("20/12/1991");
    app.usagerForm.controls.villeNaissance.setValue("Paris");
    expect(app.usagerForm.valid).toBeTruthy();
  });
});
