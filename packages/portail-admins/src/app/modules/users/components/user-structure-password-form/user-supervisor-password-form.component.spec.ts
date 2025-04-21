import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UserSupervisorPasswordFormComponent } from "./user-supervisor-password-form.component";

describe("UserSupervisorPasswordFormComponent", () => {
  let component: UserSupervisorPasswordFormComponent;
  let fixture: ComponentFixture<UserSupervisorPasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserSupervisorPasswordFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSupervisorPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Password Form", () => {
    component.newPasswordForm();
    component.parentFormGroup.controls.oldPassword.setValue("");
    expect(component.parentFormGroup.valid).toBeFalsy();

    component.parentFormGroup.controls.oldPassword.setValue("3Mxx!8ZnhST_zaa");

    component.parentFormGroup.controls.password.setValue("4uxxxtmS8TB!D983E");
    component.parentFormGroup.controls.passwordConfirmation.setValue(
      "4uxxxtmS8TB!D983E"
    );
    expect(component.parentFormGroup.valid).toBeTruthy();

    expect(component.hidePassword).toBe(true);
    expect(component.hidePasswordConfirmation).toBe(true);

    component.togglePassword();
    component.togglePasswordConfirmation();

    expect(component.hidePassword).toBe(false);
    expect(component.hidePasswordConfirmation).toBe(false);
  });

  it("Passwords OK", () => {
    const testPasswords = [
      "Azerty0123456!",
      "LsKVYkXBxDR3!",
      "!!!!!!V3K5nWvq84Fj",
      "  §'/(//(nvew3gKvzgKn",
      "x$rQAzhmaW(2Fzuk",
      "Allez les bleus2022!",
      "cpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrD",
    ];
    component.newPasswordForm();

    component.parentFormGroup.controls.oldPassword.setValue("3Mxx!8ZnhST_zaa");
    testPasswords.forEach((valueOk: string) => {
      component.parentFormGroup.controls.password.setValue(valueOk);
      component.parentFormGroup.controls.passwordConfirmation.setValue(valueOk);

      expect(component.parentFormGroup.valid).toBe(true);
    });
  });

  it("Passwords Fail", () => {
    component.newPasswordForm();
    component.parentFormGroup.controls.oldPassword.setValue("3Mxx!8ZnhST_zaa");
    const testPasswords = [
      "Azerty01234",
      "azerty01234564564",
      "LsKVYk",
      "123456879964661",
      "AZERTYU001235",
      "<<<<<<<<<<<<<<>>>>>>>>>>>>>>",
      null,
      undefined,
      "",
      "                  ",
      "cpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDcpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDcpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrD",
    ];
    testPasswords.forEach((valueOk: string) => {
      component.parentFormGroup.controls.password.setValue(valueOk);
      component.parentFormGroup.controls.passwordConfirmation.setValue(valueOk);
      expect(component.parentFormGroup.valid).toBe(false);
    });
  });
});
