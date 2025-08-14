import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MATOMO_INJECTORS, _usagerReducer } from "../../../../shared";

import { SharedModule } from "../../../shared/shared.module";
import { StepDecisionComponent } from "./step-decision.component";
import { StoreModule } from "@ngrx/store";
import { MockStore } from "@ngrx/store/testing";
import { NGRX_PROVIDERS_TESTING } from "../../../../shared/store/tests";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StepDecisionComponent", () => {
  let fixture: ComponentFixture<StepDecisionComponent>;
  let component: StepDecisionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepDecisionComponent],
      imports: [
        FormsModule,
        RouterModule.forRoot([]),
        NgbModule,
        ReactiveFormsModule,
        SharedModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        ...MATOMO_INJECTORS,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        ...NGRX_PROVIDERS_TESTING,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    TestBed.inject(MockStore);

    fixture = TestBed.createComponent(StepDecisionComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
