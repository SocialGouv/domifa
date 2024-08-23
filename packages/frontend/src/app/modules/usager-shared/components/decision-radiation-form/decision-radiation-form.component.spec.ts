import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { DecisionRadiationFormComponent } from "./decision-radiation-form.component";

import { RouterTestingModule } from "@angular/router/testing";

import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks/USAGER_VALIDE.mock";
import { UsagerFormModel } from "../../interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { UsagerDossierModule } from "../../../usager-dossier/usager-dossier.module";

describe("RadiationFormComponent", () => {
  let component: DecisionRadiationFormComponent;
  let fixture: ComponentFixture<DecisionRadiationFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionRadiationFormComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        UsagerDossierModule,
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionRadiationFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
