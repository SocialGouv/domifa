import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FaqComponent } from "./faq.component";

import { MatomoModule } from "ngx-matomo";
import { RouterTestingModule } from "@angular/router/testing";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

describe("FaqComponent", () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FaqComponent],
      imports: [
        MatomoModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
