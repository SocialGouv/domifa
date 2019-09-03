import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { global } from "@angular/compiler/src/util";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormArray, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";

import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Observable, of, Subject } from "rxjs";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { routes } from "src/app/app-routing.module";
import { AppComponent } from "src/app/app.component";
import { NotFoundComponent } from "src/app/modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "src/app/modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "src/app/modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { LoadingComponent } from "src/app/modules/loading/loading.component";
import { StructuresFormComponent } from "src/app/modules/structures/components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "src/app/modules/structures/components/structures-search/structures-search.component";
import { LoginComponent } from "src/app/modules/users/components/login/login.component";
import { RegisterUserComponent } from "src/app/modules/users/components/register-user/register-user.component";
import { ENTRETIEN_LABELS } from "src/app/shared/entretien.labels";
import { StructuresConfirmComponent } from "../../../structures/components/structures-confirm/structures-confirm.component";
import { ResetPasswordComponent } from "../../../users/components/reset-password/reset-password.component";
import { Usager } from "../../interfaces/usager";
import { ManageUsagersComponent } from "../manage/manage.component";
import { UsagersProfilComponent } from "../profil/profil-component";
import { UsagersFormComponent } from "./usagers-form";
import { UserProfilComponent } from "src/app/modules/users/components/user-profil/user-profil.component";

class MockActivatedRoute {
  public params = new Subject<any>();
}

describe("UsagersFormComponent", () => {
  let app: any;

  let fixture: any;

  const spyScrollTo = jest.fn();

  beforeEach(async(() => {
    Object.defineProperty(global.window, "scrollTo", { value: spyScrollTo });
    TestBed.configureTestingModule({
      declarations: [
        UsagersFormComponent,
        AppComponent,
        HomeComponent,
        LoginComponent,
        UsagersFormComponent,
        ManageUsagersComponent,
        UsagersProfilComponent,
        StructuresFormComponent,
        LoadingComponent,
        RegisterUserComponent,
        MentionsLegalesComponent,
        NotFoundComponent,
        StructuresSearchComponent,
        ResetPasswordComponent,
        StructuresConfirmComponent,
        UserProfilComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
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
    expect(app.title).toEqual("Enregister une domiciliation");
    expect(app.uploadResponse).toEqual({
      filePath: "",
      message: "",
      status: ""
    });

    expect(app.userId).toEqual(1);
    expect(app.structureId).toEqual(2);
    expect(app.uploadError).toEqual({});
    expect(app.labels).toEqual(ENTRETIEN_LABELS);
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

    expect(app.f).toEqual(app.usagerForm.controls);
    expect(app.u).toEqual(app.uploadForm.controls);
    expect(app.r).toEqual(app.rdvForm.controls);
    expect(app.e).toEqual(app.entretienForm.controls);
  });

  it("2. Initialisation de l'usager", () => {
    expect(app.usager).toBeTruthy();
    expect(app.usager.entretien).toBeTruthy();
    expect(app.usager.lastInteraction).toBeTruthy();
  });

  it("8. Message ERREUR", fakeAsync(() => {
    app.changeSuccessMessage("erreur", true);
    tick();
    fixture.detectChanges();
    expect(app.errorMessage).toEqual("erreur");
    expect(app.successMessage).toBeNull();
  }));

  it("8. Message SUCCESS", fakeAsync(() => {
    app.changeSuccessMessage("success");
    expect(app.successMessage).toEqual("success");
    expect(app.errorMessage).toBeNull();
    tick(10000);

    fixture.detectChanges();
  }));

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
