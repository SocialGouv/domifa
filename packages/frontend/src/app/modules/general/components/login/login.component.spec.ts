import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoginComponent } from "./login.component";

import { RouterTestingModule } from "@angular/router/testing";
import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";
import { StoreModule } from "@ngrx/store";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        ...MATOMO_INJECTORS,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Login form", () => {
    expect(component.loginForm.valid).toBeFalsy();

    component.loginForm.controls.email.setValue("MyName");
    component.loginForm.controls.password.setValue("123456789");
    expect(component.loginForm.valid).toBeFalsy();

    component.loginForm.controls.email.setValue("mon@mail.fr");
    component.loginForm.controls.password.setValue("Azerty012345");
    expect(component.loginForm.valid).toBeTruthy();

    expect(component.returnUrl).toBe("/");
  });
});
