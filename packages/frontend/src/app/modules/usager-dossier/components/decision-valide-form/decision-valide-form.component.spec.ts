import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {
  async,
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { DecisionValideFormComponent } from "./decision-valide-form.component";

describe("DecisionValideFormComponent", () => {
  let component: DecisionValideFormComponent;
  let fixture: ComponentFixture<DecisionValideFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DecisionValideFormComponent],
        imports: [
          NgbModule,
          HttpClientTestingModule,
          RouterTestingModule,
          BrowserAnimationsModule,

          SharedModule,
          ReactiveFormsModule,
          FormsModule,
        ],
        providers: [
          NgbDateCustomParserFormatter,
          { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
          {
            provide: NgbDateParserFormatter,
            useClass: NgbDateCustomParserFormatter,
          },
          { provide: APP_BASE_HREF, useValue: "/" },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

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
