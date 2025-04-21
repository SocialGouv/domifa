import { Component, Input } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { PASSWORD_VALIDATOR } from "../../PASSWORD_VALIDATOR.const";
import { PasswordValidator } from "../../services";

@Component({
  selector: "app-user-supervisor-password-form",
  templateUrl: "./user-supervisor-password-form.component.html",
})
export class UserSupervisorPasswordFormComponent {
  @Input() public submitted!: boolean;
  @Input() public parentFormGroup!: UntypedFormGroup;

  public hidePassword: boolean;
  public hidePasswordConfirmation: boolean;

  public password: string;
  public passwordConfirmation: string;

  constructor() {
    this.submitted = false;
    this.hidePassword = true;
    this.hidePasswordConfirmation = true;
    this.password = "";
    this.passwordConfirmation = "";
  }

  public setPassword(value: string): void {
    this.parentFormGroup.controls.password.setValue(value);
  }

  public setPasswordConfirm(value: string): void {
    this.parentFormGroup.controls.passwordConfirmation.setValue(value);
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public togglePasswordConfirmation(): void {
    this.hidePasswordConfirmation = !this.hidePasswordConfirmation;
  }

  // Need for test
  public newPasswordForm(): void {
    this.parentFormGroup = new UntypedFormGroup(
      {
        oldPassword: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        passwordConfirmation: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        password: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
      },
      {
        validators: [PasswordValidator.passwordMatchValidator],
      }
    );
  }
}
