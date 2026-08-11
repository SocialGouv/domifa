import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { UsersService } from "../../../admin-auth/services/users.service";
import { PasswordValidator } from "../../../admin-auth/services/password-validator.service";
import { PASSWORD_VALIDATOR } from "../../../admin-auth/types/PASSWORD_VALIDATOR.const";
import { UserSupervisorPasswordFormComponent } from "../../../admin-auth/components/user-structure-password-form/user-supervisor-password-form.component";
import { ButtonComponent } from "../../../shared/components/button/button.component";
import { CustomToastService } from "../../../shared/services";

// Password-change form + action buttons, shared by MyAccountComponent
// (voluntary change from "Mon compte") and RenewPasswordComponent (forced
// renewal after login) — both post to the same edit-my-password endpoint.
@Component({
  selector: "app-edit-password-form",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    UserSupervisorPasswordFormComponent,
  ],
  templateUrl: "./edit-password-form.component.html",
})
export class EditPasswordFormComponent implements OnInit, OnDestroy {
  @Input() public cancelLabel = "Annuler les modifications";
  @Output() public success = new EventEmitter<void>();
  @Output() public cancelled = new EventEmitter<void>();

  public passwordForm!: UntypedFormGroup;
  public hideOldPassword = true;
  public loading = false;
  public submitted = false;

  private readonly subscription = new Subscription();

  private readonly usersService = inject(UsersService);
  private readonly toastService = inject(CustomToastService);
  private readonly formBuilder = inject(UntypedFormBuilder);

  public get p(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  }

  public ngOnInit(): void {
    this.passwordForm = this.formBuilder.group(
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
        validators: [
          PasswordValidator.passwordMatchValidator,
          PasswordValidator.samePasswordValidator,
        ],
      }
    );
  }

  public toggleOldPassword(): void {
    this.hideOldPassword = !this.hideOldPassword;
  }

  public submit(): void {
    this.submitted = true;
    if (this.passwordForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.usersService.updateMyPassword(this.passwordForm.value).subscribe({
        next: () => {
          this.loading = false;
          // The backend terminates the current session as part of a
          // password change (security policy) — the caller must treat
          // this as a forced logout, not just refresh the user profile.
          this.toastService.success(
            "Félicitations ! Votre mot de passe a été modifié avec succès. Merci de vous reconnecter."
          );
          this.success.emit();
        },
        error: (err) => {
          this.loading = false;
          const message =
            err?.error?.message === "NEW_PASSWORD_SAME_AS_OLD"
              ? "Le nouveau mot de passe doit être différent de l'ancien mot de passe"
              : "Une erreur est survenue, veuillez vérifier le formulaire";
          this.toastService.error(message);
        },
      })
    );
  }

  public onCancel(): void {
    this.cancelled.emit();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
