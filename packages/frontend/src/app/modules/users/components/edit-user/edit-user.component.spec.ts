import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { EditUserComponent } from "./edit-user.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ToastrModule } from "ngx-toastr";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";

describe("EditUserComponent", () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EditUserComponent],
        imports: [
          NgbModule,
          ReactiveFormsModule,
          FormsModule,
          ToastrModule.forRoot(),
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Password Form", () => {
    component.initPasswordForm();

    expect(component.editPassword).toBe(true);

    component.passwordForm.controls.oldPassword.setValue("");
    expect(component.passwordForm.valid).toBeFalsy();

    component.passwordForm.controls.oldPassword.setValue("3Mxx!8ZnhST_zaa");

    component.passwordForm.controls.password.setValue("4uxxxtmS8TB!D983E");
    component.passwordForm.controls.confirmPassword.setValue(
      "4uxxxtmS8TB!D983E"
    );
    expect(component.passwordForm.valid).toBeTruthy();

    expect(component.hideOldPassword).toBe(true);
    expect(component.hidePassword).toBe(true);
    expect(component.hideConfirmPassword).toBe(true);

    component.togglePassword();
    component.togglePasswordConfirmation();
    component.toggleOldPassword();

    expect(component.hideOldPassword).toBe(false);
    expect(component.hidePassword).toBe(false);
    expect(component.hideConfirmPassword).toBe(false);
  });
});
