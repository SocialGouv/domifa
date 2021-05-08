import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { global } from "@angular/compiler/src/util";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatomoModule, MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";

import { UsagersFormComponent } from "./usagers-form";

describe("UsagersFormComponent", () => {
  let component: UsagersFormComponent;
  let fixture: ComponentFixture<UsagersFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UsagersFormComponent],
        imports: [
          MatomoModule,
          RouterTestingModule,
          NgbModule,
          ReactiveFormsModule,
          FormsModule,
          HttpClientModule,
          ToastrModule.forRoot(),
          HttpClientTestingModule,
        ],
        providers: [
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

      fixture = TestBed.createComponent(UsagersFormComponent);
      component = fixture.debugElement.componentInstance;
      component.ngOnInit();
    })
  );

  it("0. Création du compenent", () => {
    expect(component).toBeTruthy();
  });

  it("should update header", () => {
    expect(component.doublons).toEqual([]);

    expect(component.LIEN_PARENTE_LABELS).toBeDefined();

    expect(component.f).toEqual(component.usagerForm.controls);
  });

  it("2. Initialisation de l'usager", () => {
    expect(component.usager).toBeTruthy();
    expect(component.usager.entretien).toBeTruthy();
    expect(component.usager.lastInteraction).toBeTruthy();
  });

  it(
    "7. DOUBLON",
    waitForAsync(() => {
      component.usagerForm.controls.nom.setValue("Mamadou");
      component.usagerForm.controls.prenom.setValue("Diallo");
      component.isDoublon();
      expect(component.doublons).toEqual([]);
    })
  );

  it("6. Valid form", () => {
    component.usagerForm.controls.nom.setValue("Test nom");
    component.usagerForm.controls.prenom.setValue("Test Prenom");
    component.usagerForm.controls.surnom.setValue("Test Surnom");
    component.usagerForm.controls.dateNaissance.setValue({
      year: 1991,
      month: 12,
      day: 12,
    });
    component.usagerForm.controls.villeNaissance.setValue("Paris");
    expect(component.usagerForm.valid).toBeTruthy();
  });

  it("3. Ayant-droit", () => {
    component.resetAyantDroit();
    expect(component.usagerForm.controls.ayantsDroits.value).toEqual([]);

    component.addAyantDroit();
    component.addAyantDroit();
    component.addAyantDroit();
    component.deleteAyantDroit(1);
    expect(component.usagerForm.controls.ayantsDroits.value.length).toEqual(2);
  });
});
