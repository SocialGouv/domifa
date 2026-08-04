import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";

import { PortailAdminUser } from "@domifa/common";
import { format } from "date-fns";

import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { UsersService } from "../../../admin-auth/services/users.service";
import { PasswordValidator } from "../../../admin-auth/services/password-validator.service";
import { PASSWORD_VALIDATOR } from "../../../admin-auth/types/PASSWORD_VALIDATOR.const";
import { UserSupervisorPasswordFormComponent } from "../../../admin-auth/components/user-structure-password-form/user-supervisor-password-form.component";
import { ButtonComponent } from "../../../shared/components/button/button.component";
import { CustomToastService } from "../../../shared/services";

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    UserSupervisorPasswordFormComponent,
  ],
})
export class MyAccountComponent implements OnInit, OnDestroy {
  public me: PortailAdminUser | null;

  public forcePasswordChange: boolean;
  public editPassword: boolean;
  public submitted: boolean;
  public loading: boolean;
  public hideOldPassword: boolean;

  public lastPasswordUpdate: string;
  public passwordForm!: UntypedFormGroup;

  private readonly subscription = new Subscription();

  public get p() {
    return this.passwordForm.controls;
  }

  constructor(
    private readonly authService: AdminAuthService,
    private readonly usersService: UsersService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly titleService: Title,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.forcePasswordChange = false;
    this.editPassword = false;
    this.submitted = false;
    this.loading = false;
    this.hideOldPassword = true;
    this.me = null;
    this.lastPasswordUpdate = "Aucune modification de mot de passe enregistrée";
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Mon compte - Admin DomiFa");

    this.me = this.authService.currentUserValue;
    this.getLastPasswordUpdate();

    if (
      this.activatedRoute.snapshot.queryParamMap.get("forcePasswordChange") ===
      "true"
    ) {
      this.forcePasswordChange = true;
      this.initPasswordForm();
    }
  }

  public initPasswordForm(): void {
    this.editPassword = true;

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
        validators: [PasswordValidator.passwordMatchValidator],
      }
    );
  }

  private getLastPasswordUpdate(): void {
    this.subscription.add(
      this.usersService.getLastPasswordUpdate().subscribe({
        next: (lastPassword: Date | null) => {
          this.lastPasswordUpdate =
            lastPassword === null
              ? "Aucune modification de mot de passe enregistrée"
              : "Dernière modification: " +
                format(new Date(lastPassword), "dd/MM/yyyy");
        },
      })
    );
  }

  public toggleOldPassword(): void {
    this.hideOldPassword = !this.hideOldPassword;
  }

  public updateMyPassword(): void {
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
          this.editPassword = false;
          this.forcePasswordChange = false;
          this.submitted = false;
          this.getLastPasswordUpdate();
          this.toastService.success(
            "Félicitations ! : votre mot de passe a été modifié avec succès"
          );
        },
        error: () => {
          this.loading = false;
          this.toastService.error(
            "Une erreur est survenue, veuillez vérifier le formulaire"
          );
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
