import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { global } from "@angular/compiler/src/util";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatomoModule } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { routes } from "src/app/app-routing.module";
import { AppComponent } from "src/app/app.component";
import { GeneralModule } from "src/app/modules/general/general.module";
import { StatsModule } from "src/app/modules/stats/stats.module";
import { StructuresModule } from "src/app/modules/structures/structures.module";
import { UsagersModule } from "../../usagers.module";
import { UsagersFormComponent } from "./usagers-form";

describe("UsagersFormComponent", () => {
  let app: any;

  let fixture: any;

  const spyScrollTo = jest.fn();

  beforeEach(async(() => {
    Object.defineProperty(global.window, "scrollTo", { value: spyScrollTo });
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        MatomoModule,
        GeneralModule,
        UsagersModule,
        StatsModule,
        StructuresModule,
        RouterTestingModule.withRoutes(routes),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        ToastrModule.forRoot({
          enableHtml: true,
          positionClass: "toast-top-full-width",
          preventDuplicates: true,
          progressAnimation: "increasing",
          progressBar: true,
          timeOut: 2000
        }),
        BrowserAnimationsModule,
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

  it("should update header", () => {
    expect(app.title).toEqual("Enregistrer une domiciliation");

    expect(app.doublons).toEqual([]);
    expect(app.documents).toEqual([]);

    expect(app.labels.residence).toBeDefined();
    expect(app.labels.cause).toBeDefined();
    expect(app.labels.raison).toBeDefined();

    expect(app.f).toEqual(app.usagerForm.controls);
    expect(app.r).toEqual(app.rdvForm.controls);
  });

  it("2. Initialisation de l'usager", () => {
    expect(app.usager).toBeTruthy();
    expect(app.usager.entretien).toBeTruthy();
    expect(app.usager.lastInteraction).toBeTruthy();
  });

  it("7. DOUBLON", async(() => {
    app.usagerForm.controls.nom.setValue("Mamadou");
    app.usagerForm.controls.prenom.setValue("Diallo");
    app.isDoublon();
    expect(app.doublons).toEqual([]);
  }));

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
    app.usager.decision.statut = "INSTRUCTION";
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
