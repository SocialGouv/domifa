import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../interfaces";

import { EtatCivilParentFormComponent } from "./etat-civil-parent-form.component";

describe("EtatCivilParentFormComponent", () => {
  let component: EtatCivilParentFormComponent;
  let fixture: ComponentFixture<EtatCivilParentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtatCivilParentFormComponent],
      imports: [
        NgbModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        NgxIntlTelInputModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EtatCivilParentFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Conversion des données brutes du formulaire", () => {
    const testForm = {
      ayantsDroits: [
        {
          dateNaissance: { year: 2022, month: 8, day: 1 },
          lien: "ENFANT",
          nom: "AD NOM",
          prenom: "AD PRENOM",
        },
      ],
      ayantsDroitsExist: true,
      contactByPhone: true,
      customRef: null,
      dateNaissance: {
        day: 3,
        month: 8,
        year: 2022,
      },
      email: "",
      langue: "ar",
      nom: "TEST",
      prenom: "TEST PRENOM ",
      sexe: "homme",
      surnom: "Chips",
      numeroDistribution: "TSA 1000",
      telephone: {
        countryCode: "FR",
        dialCode: "+33",
        e164Number: "+33606060606",
        internationalNumber: "+33 6 06 06 06 06",
        nationalNumber: "06 06 06 06 06",
        // eslint-disable-next-line id-denylist
        number: "6 06 06 06 06",
      },
      villeNaissance: "Paris",
    };

    expect(component.getEtatCivilForm(testForm)).toEqual({
      ayantsDroits: [
        {
          dateNaissance: new Date("2022-08-01T21:59:59.999Z"),
          lien: "ENFANT",
          nom: "AD NOM",
          prenom: "AD PRENOM",
        },
      ],
      contactByPhone: true,
      customRef: null,
      dateNaissance: new Date("2022-08-03T21:59:59.999Z"),
      email: null,
      langue: "ar",
      numeroDistribution: "TSA 1000",
      nom: "TEST",
      prenom: "TEST PRENOM",
      sexe: "homme",
      surnom: "Chips",
      telephone: {
        countryCode: "fr",
        numero: "0606060606",
      },
      villeNaissance: "Paris",
    });
  });
});
