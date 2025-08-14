import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";

import { SharedModule } from "./../../../shared/shared.module";
import { StepEtatCivilComponent } from "./step-etat-civil.component";
import { AuthService } from "../../../shared/services/auth.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { NGRX_PROVIDERS_TESTING } from "../../../../shared/store/tests";
import { RouterModule } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("StepEtatCivilComponent", () => {
  let component: StepEtatCivilComponent;
  let fixture: ComponentFixture<StepEtatCivilComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [StepEtatCivilComponent],
      imports: [
        RouterModule.forRoot([]),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        NgxIntlTelInputModule,
      ],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(withInterceptorsFromDi()),
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: APP_BASE_HREF, useValue: "/" },
        ...NGRX_PROVIDERS_TESTING,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StepEtatCivilComponent);
    component = fixture.debugElement.componentInstance;
    component.ngOnInit();
  });

  it("Should create component", () => {
    expect(component).toBeTruthy();
    expect(component.duplicates).toEqual([]);
    expect(component.LIEN_PARENTE_LABELS).toBeDefined();
    expect(component.usager).toBeTruthy();
    expect(component.usager.entretien).toBeTruthy();
    expect(component.usager.lastInteraction).toBeTruthy();
    expect(component.f).toEqual(component.usagerForm.controls);
  });

  it("Duplicates", () => {
    component.usagerForm.controls.nom.setValue("Mamadou");
    component.usagerForm.controls.prenom.setValue("Diallo");
    component.isDuplicateName();
    expect(component.duplicates).toEqual([]);
  });

  it("Form validation", () => {
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

  it("Ayant-droit", () => {
    component.resetAyantDroit();
    expect(component.usagerForm.controls.ayantsDroits.value).toEqual([]);

    component.addAyantDroit();
    component.addAyantDroit();
    component.addAyantDroit();
    component.deleteAyantDroit(1);
    expect(component.usagerForm.controls.ayantsDroits.value.length).toEqual(2);
  });
});
