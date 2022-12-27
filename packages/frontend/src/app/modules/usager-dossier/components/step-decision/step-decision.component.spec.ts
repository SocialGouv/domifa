import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

import { SharedModule } from "../../../shared/shared.module";
import { StepDecisionComponent } from "./step-decision.component";

describe("StepDecisionComponent", () => {
  let fixture: ComponentFixture<StepDecisionComponent>;
  let component: StepDecisionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepDecisionComponent],
      imports: [
        SharedModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(StepDecisionComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
