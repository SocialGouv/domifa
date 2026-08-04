import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Title } from "@angular/platform-browser";

import { PASSWORD_VALIDATOR } from "../../types";
import { AdminAuthService } from "../../services/admin-auth.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { ButtonComponent } from "../../../shared/components/button/button.component";

const newPasswordsMatchValidator: ValidatorFn = (
  control
): ValidationErrors | null => {
  const newPassword = control.get("newPassword")?.value;
  const newPasswordConfirm = control.get("newPasswordConfirm")?.value;
  return newPassword === newPasswordConfirm ? null : { noPassswordMatch: true };
};

const newPasswordDifferentFromOldValidator: ValidatorFn = (
  control
): ValidationErrors | null => {
  const oldPassword = control.get("password")?.value;
  const newPassword = control.get("newPassword")?.value;
  return oldPassword && newPassword && oldPassword === newPassword
    ? { samePassword: true }
    : null;
};

@Component({
  selector: "app-renew-password",
  templateUrl: "./renew-password.component.html",
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
})
export class RenewPasswordComponent implements OnInit {
  public form!: UntypedFormGroup;
  public email = "";

  public hidePassword: boolean;
  public hideNewPassword: boolean;
  public hideNewPasswordConfirm: boolean;
  public loading: boolean;
  public submitted: boolean;
  public loginError: boolean;

  @ViewChild("inputNewPassword")
  public inputNewPassword?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AdminAuthService,
    private readonly toastr: CustomToastService
  ) {
    this.hidePassword = true;
    this.hideNewPassword = true;
    this.hideNewPasswordConfirm = true;
    this.loading = false;
    this.submitted = false;
    this.loginError = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Renouveler mon mot de passe - Admin DomiFa");

    // Guarded by PasswordRenewalGuard: pendingPasswordChangeEmail is always
    // set when this component is reached.
    this.email = this.authService.pendingPasswordChangeEmail ?? "";

    this.form = this.formBuilder.group(
      {
        password: ["", Validators.required],
        newPassword: ["", Validators.compose(PASSWORD_VALIDATOR)],
        newPasswordConfirm: ["", [Validators.required]],
      },
      {
        validators: [
          newPasswordsMatchValidator,
          newPasswordDifferentFromOldValidator,
        ],
      }
    );

    setTimeout(() => this.inputNewPassword?.nativeElement.focus());
  }

  public get f(): Record<string, AbstractControl> {
    return this.form.controls;
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public toggleNewPassword(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }

  public toggleNewPasswordConfirm(): void {
    this.hideNewPasswordConfirm = !this.hideNewPasswordConfirm;
  }

  public cancel(): void {
    this.authService.pendingPasswordChangeEmail = null;
    this.router.navigate(["/auth/login"]);
  }

  public submit(): void {
    this.submitted = true;
    this.loginError = false;

    if (this.form.invalid) {
      this.toastr.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    this.loading = true;
    this.authService
      .login({
        email: this.email,
        password: this.f.password.value,
        newPassword: this.f.newPassword.value,
      })
      .subscribe({
        next: (apiAuthResponse) => {
          this.loading = false;
          this.authService.pendingPasswordChangeEmail = null;
          this.toastr.success("Votre mot de passe a été modifié avec succès");
          this.authService.saveToken(apiAuthResponse);

          if (apiAuthResponse.user.role === "super-admin-domifa") {
            this.router.navigate(["/structure"]);
          } else {
            this.router.navigate(["/stats"]);
          }
        },
        error: (err) => {
          this.loading = false;
          if (err?.error?.message === "CHANGE_PASSWORD_REQUIRED") {
            // Shouldn't normally recur, but keep the pending state so the
            // guard still lets the user retry.
            return;
          }
          if (err?.error?.message === "NEW_PASSWORD_SAME_AS_OLD") {
            this.toastr.error(
              "Le nouveau mot de passe doit être différent de l'ancien"
            );
            return;
          }
          this.loginError = true;
        },
      });
  }
}
