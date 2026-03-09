import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoginFormComponent } from "./login-form.component";

import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("LoginComponent", () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ...MATOMO_INJECTORS,
        RouterModule.forRoot([]),
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
    fixture = TestBed.createComponent(LoginFormComponent);
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
