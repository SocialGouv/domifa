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
import { setFormPhone } from "../../../../shared";

describe("ProfilEditSmsPreferenceComponent", () => {
  let component: ProfilEditSmsPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditSmsPreferenceComponent>;
  beforeEach(() => {
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

    fixture = TestBed.createComponent(ProfilEditSmsPreferenceComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.usager.preference.contactByPhone = true;
    component.ngOnInit();
  });

  it("Création du composant", () => {
    expect(component).toBeTruthy();
    expect(component.editPreferences).toBeFalsy();
    component.togglePreferences();
    expect(component.editPreferences).toBeTruthy();
    expect(component.preferenceForm).toBeTruthy();
  });

  describe("Test des numéros de téléphone pour recevoir les SMS : ATTENTION, seul les portables sont autorisés !", () => {
    it("❌  Mise à jour de l'input avec un mauvais numéro", () => {
      component.togglePreferences();
      component.preferenceForm.controls.telephone.setValue({
        contactByPhone: true,
      });

      component.preferenceForm.controls.telephone.setValue(
        setFormPhone({
          countryCode: CountryISO.Martinique,
          numero: "0s 96 66 68 88",
        })
      );
      expect(component.preferenceForm.controls.telephone.valid).toBeFalsy();

      component.preferenceForm.controls.telephone.patchValue(
        setFormPhone({
          countryCode: CountryISO.UnitedStates,
          numero: "",
        })
      );

      expect(component.preferenceForm.controls.telephone.valid).toBeFalsy();

      component.preferenceForm.controls.telephone.patchValue(
        setFormPhone({
          countryCode: CountryISO.UnitedStates,
          numero: "NUMBER_FAIL",
        })
      );

      expect(component.preferenceForm.controls.telephone.valid).toBeFalsy();

      component.preferenceForm.controls.telephone.patchValue(
        setFormPhone({
          countryCode: CountryISO.France,
          numero: "2126063600",
        })
      );

      expect(component.preferenceForm.controls.telephone.valid).toBeFalsy();
    });

    it("✅  Mise à jour de l'input avec données valides", () => {
      component.togglePreferences();

      component.preferenceForm.controls.telephone.patchValue(
        setFormPhone({
          countryCode: CountryISO.Guadeloupe,
          numero: "691 22 39 00",
        })
      );
      expect(component.preferenceForm.controls.telephone.valid).toBeTruthy();

      component.preferenceForm.controls.telephone.patchValue(
        setFormPhone({
          countryCode: CountryISO.Martinique,
          numero: "696 50 68 88",
        })
      );
      expect(component.preferenceForm.controls.telephone.valid).toBeTruthy();

      component.preferenceForm.controls.telephone.patchValue(
        setFormPhone({
          countryCode: CountryISO.FrenchGuiana,
          numero: "694/33.70.70",
        })
      );
      expect(component.preferenceForm.controls.telephone.valid).toBeTruthy();
    });
  });
});
