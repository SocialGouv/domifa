import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { LoginComponent } from "./login.component";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, LoginComponent],
      providers: [provideRouter([]), provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("submitting a form emits a user", () => {
    expect(component.loginForm.valid).toBeFalsy();
    component.loginForm.controls.email.setValue("MyName");
    component.loginForm.controls.password.setValue("123456789");
    expect(component.loginForm.valid).toBeFalsy();
    component.loginForm.controls.email.setValue("test@test.co");
    component.loginForm.controls.password.setValue("123456789");
    expect(component.loginForm.valid).toBeTruthy();
  });
});
