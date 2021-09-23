import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerLoginComponent } from "./usager-login.component";

describe("UsagerLoginComponent", () => {
  let component: UsagerLoginComponent;
  let fixture: ComponentFixture<UsagerLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerLoginComponent],
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
    component.loginForm.controls["email"].setValue("test@test.com");
    component.loginForm.controls["password"].setValue("123456789");
    expect(component.loginForm.valid).toBeTruthy();
  });
});
