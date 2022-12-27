import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../_common/mocks";

import { UsagerLoginComponent } from "./usager-login.component";

describe("UsagerLoginComponent", () => {
  let component: UsagerLoginComponent;
  let fixture: ComponentFixture<UsagerLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerLoginComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        NgbModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagerLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("submitting a form emits a user", () => {
    expect(component.loginForm.valid).toBeFalsy();
    component.loginForm.controls.login.setValue("MyName");
    component.loginForm.controls.password.setValue("123456789");
    expect(component.loginForm.valid).toBeTruthy();
  });
});
