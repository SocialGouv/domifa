import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks/USAGER_VALIDE.mock";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { DecisionRefusFormComponent } from "./decision-refus-form.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { UsagerDossierModule } from "../../usager-dossier.module";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("DecisionRefusFormComponent", () => {
  let component: DecisionRefusFormComponent;
  let fixture: ComponentFixture<DecisionRefusFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionRefusFormComponent],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        UsagerDossierModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionRefusFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
