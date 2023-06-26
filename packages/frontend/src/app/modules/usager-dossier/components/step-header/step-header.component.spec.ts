import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";

import { StepHeaderComponent } from "./step-header.component";
import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("StepHeaderComponent", () => {
  let component: StepHeaderComponent;
  let fixture: ComponentFixture<StepHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepHeaderComponent],
      imports: [
        NgbModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepHeaderComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it(`ETAPES_FORM_DOM has default value`, () => {
    expect(component.ETAPES_FORM_DOM).toEqual([
      `État civil`,
      `Prise de RDV`,
      `Entretien`,
      `Pièces justificatives`,
      `Décision finale`,
    ]);
  });

  it(`ETAPES_DEMANDE_URL has default value`, () => {
    expect(component.ETAPES_DEMANDE_URL).toEqual([
      `etat-civil`,
      `rendez-vous`,
      `entretien`,
      `documents`,
      `decision`,
    ]);
  });
});
