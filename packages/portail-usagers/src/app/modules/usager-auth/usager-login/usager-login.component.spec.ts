import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerLoginComponent } from "./usager-login.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

describe("UsagerLoginComponent", () => {
  let component: UsagerLoginComponent;
  let fixture: ComponentFixture<UsagerLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerLoginComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
        NgbModule,
        FormsModule,
        RouterTestingModule,
      ],
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
    component.loginForm.controls["usagerAuthId"].setValue("MyName");
    component.loginForm.controls["password"].setValue("123456789");
    expect(component.loginForm.valid).toBeTruthy();
  });
});
