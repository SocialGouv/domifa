import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { RouterTestingModule } from "@angular/router/testing";
import { StepDocumentsComponent } from "./step-documents.component";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { APP_BASE_HREF } from "@angular/common";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

describe("StepDocumentsComponent", () => {
  let component: StepDocumentsComponent;
  let fixture: ComponentFixture<StepDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        HttpClientTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [StepDocumentsComponent],
    });
    fixture = TestBed.createComponent(StepDocumentsComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
