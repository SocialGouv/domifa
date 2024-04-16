import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DecisionStandbyFormComponent } from "./decision-standby-form.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import {
  USER_STRUCTURE_MOCK,
  USAGER_ACTIF_MOCK,
} from "../../../../../_common/mocks";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

describe("DecisionStandbyFormComponent", () => {
  let component: DecisionStandbyFormComponent;
  let fixture: ComponentFixture<DecisionStandbyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionStandbyFormComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionStandbyFormComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
