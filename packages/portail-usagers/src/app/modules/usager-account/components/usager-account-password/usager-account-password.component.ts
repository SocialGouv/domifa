import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";

import { PasswordValidator } from "../../../usager-auth/usager-login/password-validator.service";
import { UsagerAccountPasswordService } from "../../services/usager-account-password.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";

@Component({
  selector: "app-usager-account-password",
  templateUrl: "./usager-account-password.component.html",
  imports: [CommonModule, ReactiveFormsModule],
})
export class UsagerAccountPasswordComponent implements OnInit {
  public passwordForm!: UntypedFormGroup;

  public forcePasswordChange: boolean;
  public submitted: boolean;
  public loading: boolean;
  public success: boolean;

  public hideOldPassword: boolean;
  public hidePassword: boolean;
  public hidePasswordConfirmation: boolean;

  public get f(): Record<string, AbstractControl> {
    return this.passwordForm.controls;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerAccountPasswordService: UsagerAccountPasswordService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.forcePasswordChange = false;
    this.submitted = false;
    this.loading = false;
    this.success = false;
    this.hideOldPassword = true;
    this.hidePassword = true;
    this.hidePasswordConfirmation = true;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer mon compte - Mon DomiFa");

    this.forcePasswordChange =
      this.activatedRoute.snapshot.queryParamMap.get("forcePasswordChange") ===
      "true";

    this.initForm();
  }

  private initForm(): void {
    this.passwordForm = this.formBuilder.group(
      {
        oldPassword: ["", [Validators.required]],
        password: [
          "",
          Validators.compose([
            Validators.required,
            PasswordValidator.patternValidator(/\d/, { hasNumber: true }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true,
            }),
            PasswordValidator.patternValidator(/[a-z]/, {
              hasLowerCase: true,
            }),
            PasswordValidator.patternValidator(
              // eslint-disable-next-line no-useless-escape
              /[@\[\]^_!"#$%&'()*+,\-./:;{}<>=|~?]/,
              { hasSpecialCharacter: true }
            ),
            Validators.minLength(12),
            Validators.maxLength(150),
          ]),
        ],
        passwordConfirmation: [
          "",
          Validators.compose([
            Validators.required,
            PasswordValidator.passwordMatchValidator("password"),
          ]),
        ],
      },
      {
        validators: [
          PasswordValidator.fieldsNotEqualsValidator({
            ctrl1Name: "oldPassword",
            ctrl2Name: "password",
            errName: "new-password-same-as-old-password",
          }),
        ],
      }
    );
  }

  public toggleOldPassword(): void {
    this.hideOldPassword = !this.hideOldPassword;
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public togglePasswordConfirmation(): void {
    this.hidePasswordConfirmation = !this.hidePasswordConfirmation;
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

    this.usagerAccountPasswordService
      .updateMyPassword(this.passwordForm.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.forcePasswordChange = false;
          this.submitted = false;
          this.passwordForm.reset();
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
      });
  }
}
