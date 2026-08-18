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

import { CustomToastService } from "../../../shared/services";
import { SharedModule } from "../../../shared/shared.module";
import { PASSWORD_VALIDATOR } from "../../../users/PASSWORD_VALIDATOR.const";
import { PasswordValidator } from "../../../users/services";
import { ManageUsersService } from "../../services/manage-users.service";

// Password-change form + action buttons, shared by EditUserComponent
// (voluntary change from "Mon compte") and RenewPasswordComponent (forced
// renewal after login) — both post to the same edit-my-password endpoint.
@Component({
  selector: "app-edit-password-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: "./edit-password-form.component.html",
})
export class EditPasswordFormComponent implements OnInit, OnDestroy {
  @Input() public cancelLabel = "Annuler les modifications";
  @Output() public readonly success = new EventEmitter<void>();
  @Output() public readonly cancelled = new EventEmitter<void>();

  public passwordForm!: UntypedFormGroup;
  public hideOldPassword = true;
  public loading = false;
  public submitted = false;

  private readonly subscription = new Subscription();

  private readonly manageUsersService = inject(ManageUsersService);
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
      this.manageUsersService
        .updateMyPassword(this.passwordForm.value)
        .subscribe({
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
