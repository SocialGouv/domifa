import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MATOMO_INJECTORS } from "../../../shared";

import { UsagerLoginComponent } from "./usager-login.component";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { SharedModule } from "../../shared/shared.module";

describe("UsagerLoginComponent", () => {
  let component: UsagerLoginComponent;
  let fixture: ComponentFixture<UsagerLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerLoginComponent],
      imports: [
        ReactiveFormsModule,
        MATOMO_INJECTORS,
        NgbModule,
        FormsModule,
        RouterModule.forRoot([]),
        SharedModule,
      ],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
