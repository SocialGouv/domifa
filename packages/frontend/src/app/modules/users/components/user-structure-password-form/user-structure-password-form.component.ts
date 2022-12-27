import { Component, Input, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { PASSWORD_VALIDATOR } from "../../PASSWORD_VALIDATOR.const";
import { PasswordValidator } from "../../services";

@Component({
  selector: "app-user-structure-password-form",
  templateUrl: "./user-structure-password-form.component.html",
  styleUrls: ["./user-structure-password-form.component.css"],
})
export class UserStructurePasswordFormComponent implements OnInit {
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

  public ngOnInit(): void {
    this.passwordConfirmation = null;
    this.password = null;
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
  public newPasswordForm() {
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
