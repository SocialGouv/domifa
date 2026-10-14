import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { UserStructurePasswordFormComponent } from "./user-structure-password-form.component";

describe("UserStructurePasswordFormComponent", () => {
  let component: UserStructurePasswordFormComponent;
  let fixture: ComponentFixture<UserStructurePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserStructurePasswordFormComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStructurePasswordFormComponent);
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

  it("each 'Afficher' checkbox reveals its own field", () => {
    component.newPasswordForm();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const password = el.querySelector<HTMLInputElement>("#password");
    const confirmation = el.querySelector<HTMLInputElement>(
      "#passwordConfirmationInput"
    );

    el.querySelector<HTMLInputElement>("#show-password")?.click();
    fixture.detectChanges();
    expect(password?.type).toBe("text");
    expect(confirmation?.type).toBe("password");

    el.querySelector<HTMLInputElement>("#passwordConfirm-show")?.click();
    fixture.detectChanges();
    expect(confirmation?.type).toBe("text");

    el.querySelector<HTMLInputElement>("#show-password")?.click();
    fixture.detectChanges();
    expect(password?.type).toBe("password");
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
