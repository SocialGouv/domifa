import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";

import { EditPasswordFormComponent } from "./edit-password-form.component";

describe("EditPasswordFormComponent", () => {
  let component: EditPasswordFormComponent;
  let fixture: ComponentFixture<EditPasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPasswordFormComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should be invalid when the new password matches the old one", () => {
    component.passwordForm.controls.oldPassword.setValue("Azerty0123456!");
    component.passwordForm.controls.password.setValue("Azerty0123456!");
    component.passwordForm.controls.passwordConfirmation.setValue(
      "Azerty0123456!"
    );

    expect(component.passwordForm.errors?.samePassword).toBe(true);
    expect(component.passwordForm.valid).toBe(false);
  });

  it("should be invalid when password and confirmation don't match", () => {
    component.passwordForm.controls.oldPassword.setValue("Azerty0123456!");
    component.passwordForm.controls.password.setValue("NouveauPass123!");
    component.passwordForm.controls.passwordConfirmation.setValue(
      "AutreChose456!"
    );

    expect(component.passwordForm.errors?.noPassswordMatch).toBe(true);
    expect(component.passwordForm.valid).toBe(false);
  });

  it("should be valid with a different, matching new password", () => {
    component.passwordForm.controls.oldPassword.setValue("Azerty0123456!");
    component.passwordForm.controls.password.setValue("NouveauPass123!");
    component.passwordForm.controls.passwordConfirmation.setValue(
      "NouveauPass123!"
    );

    expect(component.passwordForm.valid).toBe(true);
  });

  it("should toggle old password visibility", () => {
    expect(component.hideOldPassword).toBe(true);
    component.toggleOldPassword();
    expect(component.hideOldPassword).toBe(false);
  });

  it("should emit cancelled when cancel is triggered", () => {
    const cancelledSpy = jest.spyOn(component.cancelled, "emit");
    component.onCancel();
    expect(cancelledSpy).toHaveBeenCalled();
  });

  it("should not submit an invalid form", () => {
    component.submit();
    expect(component.submitted).toBe(true);
    expect(component.loading).toBe(false);
  });
});
