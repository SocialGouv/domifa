import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

import { SharedModule } from "../../../shared/shared.module";

import { StepFooterComponent } from "./step-footer.component";

describe("StepFooterComponent", () => {
  let component: StepFooterComponent;
  let fixture: ComponentFixture<StepFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepFooterComponent],
      imports: [
        NgbModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
