import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterTestingModule } from "@angular/router/testing";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter.service";
import { CustomDatepickerI18n } from "../../../shared/services/date-french.service";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { DecisionValideFormComponent } from "./decision-valide-form.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { UsagerDossierModule } from "../../usager-dossier.module";

describe("DecisionValideFormComponent", () => {
  let component: DecisionValideFormComponent;
  let fixture: ComponentFixture<DecisionValideFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionValideFormComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        UsagerDossierModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
        {
          provide: NgbDateParserFormatter,
          useClass: NgbDateCustomParserFormatter,
        },
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionValideFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
