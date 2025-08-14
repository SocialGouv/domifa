import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { RegisterUserComponent } from "./register-user.component";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("RegisterUserComponent", () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterUserComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
      ],

      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Check password", () => {
    component.userForm.controls.password.setValue("1234567891011");
    component.userForm.controls.passwordConfirmation.setValue("BBBBB");
    expect(component.userForm.errors).toEqual({ noPassswordMatch: true });
    component.userForm.controls.passwordConfirmation.setValue("1234567891011");
    expect(component.userForm.errors).toBeNull();
    expect(component.userForm.controls.password.errors).toEqual({
      hasSpecialCharacter: true,
      hasCapitalCase: true,
      hasLowerCase: true,
    });
  });
});
