import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { EditUserComponent } from "./edit-user.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";

describe("EditUserComponent", () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditUserComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

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
    expect(component.hidePasswordConfirm).toBe(true);

    component.togglePassword();
    component.togglePasswordConfirmation();
    component.toggleOldPassword();

    expect(component.hideOldPassword).toBe(false);
    expect(component.hidePassword).toBe(false);
    expect(component.hidePasswordConfirm).toBe(false);
  });

  it("Passwords OK", () => {
    const testPasswords = [
      "Azerty0123456",
      "LsKVYkXBxDR3",
      "!!!!!!V3K5nWvq84Fj",
      "  §'/(//(nvew3gKvzgKn",
      "x$rQAzhmaW(2Fzuk",
      "Allez les bleus2022",
      "cpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrD",
    ];
    component.initPasswordForm();
    expect(component.editPassword).toBe(true);
    component.passwordForm.controls.oldPassword.setValue("3Mxx!8ZnhST_zaa");
    testPasswords.forEach((valueOk: string) => {
      component.passwordForm.controls.password.setValue(valueOk);
      component.passwordForm.controls.confirmPassword.setValue(valueOk);

      expect(component.passwordForm.valid).toBe(true);
    });
  });

  it("Passwords Fail", () => {
    component.initPasswordForm();
    expect(component.editPassword).toBe(true);
    component.passwordForm.controls.oldPassword.setValue("3Mxx!8ZnhST_zaa");
    const testPasswords = [
      "Azerty01234",
      "azerty01234564564",
      "LsKVYk",
      "123456879964661",
      "<<<<<<<<<<<<<<>>>>>>>>>>>>>>",
      null,
      undefined,
      "",
      "                  ",
      "cpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDcpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDcpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrD",
    ];
    testPasswords.forEach((valueOk: string) => {
      component.passwordForm.controls.password.setValue(valueOk);
      component.passwordForm.controls.confirmPassword.setValue(valueOk);
      expect(component.passwordForm.valid).toBe(false);
    });
  });
});
