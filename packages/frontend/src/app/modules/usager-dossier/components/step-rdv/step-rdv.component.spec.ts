import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { StepRdvComponent } from "./step-rdv.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { UsagerDossierModule } from "../../usager-dossier.module";

describe("StepRdvComponent", () => {
  let component: StepRdvComponent;
  let fixture: ComponentFixture<StepRdvComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StepRdvComponent],
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
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepRdvComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
