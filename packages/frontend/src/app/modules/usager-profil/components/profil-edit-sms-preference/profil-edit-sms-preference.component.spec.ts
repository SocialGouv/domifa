import { HttpClientTestingModule } from "@angular/common/http/testing";
import { APP_BASE_HREF, CommonModule } from "@angular/common";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/compiler";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { CountryISO, NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { ProfilEditSmsPreferenceComponent } from "./profil-edit-sms-preference.component";

describe("ProfilEditSmsPreferenceComponent", () => {
  let component: ProfilEditSmsPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditSmsPreferenceComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ProfilEditSmsPreferenceComponent],
      imports: [
        NgbModule,
        CommonModule,
        SharedModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        NgxIntlTelInputModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        FormsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilEditSmsPreferenceComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.usager.preference.contactByPhone = true;
    fixture.detectChanges();
  });

  it("Création du composant", () => {
    expect(component).toBeTruthy();
    expect(component.editPreferences).toBeFalsy();
    component.togglePreferences();
    expect(component.editPreferences).toBeTruthy();
    expect(component.preferenceForm).toBeTruthy();
  });

  it("❌  Mise à jour de l'input avec un mauvais numéro", () => {
    // Faux numéro de portable en guadeloupe
    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Guadeloupe,
        numero: "///609 24 39 00ll",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("INVALID");

    // Faux numéro de portable en Martinique
    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Martinique,
        numero: "0s 96 66 68 88",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("INVALID");

    // Faux numéro de portable en Réunion
    // Les numéros en 639 ne sont valides qu'à Mayotte, mais pas à la Réunion
    // Malgré le fait que les 2 territoires sont en +262
    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Réunion,
        numero: "639 6 66 68 88",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("INVALID");

    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Mayotte,
        numero: "63996 68 88",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("VALID");

    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Mayotte,
        numero: "6311119912345",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("INVALID");
  });

  it("✅  Mise à jour de l'input avec données valides", async () => {
    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Guadeloupe,
        numero: "691 25 39.00",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("VALID");

    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Réunion,
        numero: "976223232",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("VALID");

    component.usager.preference = {
      contactByPhone: true,
      telephone: {
        countryCode: CountryISO.Réunion,
        numero: "693 55 39.00",
      },
    };
    component.initForm();
    expect(component.preferenceForm.status).toEqual("VALID");
  });
});
