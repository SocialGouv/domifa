import { NoWhiteSpaceValidator } from "../../../../shared/validators/no-whitespace.validator";
import { Subscription } from "rxjs";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";
import { PASSWORD_VALIDATOR } from "../../PASSWORD_VALIDATOR.const";
import { EmailValidator } from "../../../../shared";

@Component({
  selector: "app-reset-password",
  styleUrls: ["./reset-password.component.css"],
  templateUrl: "./reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public emailForm!: UntypedFormGroup;
  public resetForm!: UntypedFormGroup;

  public submitted: boolean;
  public success: boolean;
  public loading: boolean;

  public token?: string;
  public userId?: string;
  public errorLabels: { [key: string]: string };

  private subscription = new Subscription();

  public get e() {
    return this.emailForm.controls;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.resetForm.controls;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: UsersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.success = false;
    this.submitted = false;
    this.loading = false;

    this.errorLabels = {
      HARD_RESET_EXPIRED: "Le code a expiré, merci de recommencer la procédure",
      HARD_RESET_INCORRECT_TOKEN:
        "Le code de confirmation inséré est incorrect.",
      TOKEN_EXPIRED:
        "La procédure de renouvellement de votre mot de passe a expiré, veuillez renouveler votre demande",
    };
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Renouveler mon mot de passe DomiFa");

    if (this.route.snapshot.params.token) {
      const token = this.route.snapshot.params.token;
      const userId = this.route.snapshot.params.userId;

      this.subscription.add(
        this.userService.checkPasswordToken({ userId, token }).subscribe({
          next: () => {
            this.token = token;
            this.userId = userId;

            this.initPasswordForm();
          },
          error: (error) => {
            const errorMessage =
              typeof this.errorLabels[error.message] !== "undefined"
                ? this.errorLabels[error.message]
                : "Le lien est incorrect, veuillez recommencer la procédure";
            this.toastService.error(errorMessage);

            this.router.navigate(["/users/reset-password"]);
          },
        })
      );
    } else {
      this.initEmailForm();
    }
  }

  public initEmailForm(): void {
    this.emailForm = this.formBuilder.group<{ email: FormControl<string> }>({
      email: new FormControl<string>("", {
        validators: [
          Validators.required,
          EmailValidator,
          NoWhiteSpaceValidator,
        ],
      }),
    });
  }

  public initPasswordForm(): void {
    this.resetForm = this.formBuilder.group(
      {
        token: [this.token, Validators.required],
        userId: [this.userId, Validators.required],
        passwordConfirmation: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        password: new FormControl(null, Validators.compose(PASSWORD_VALIDATOR)),
      },
      {
        validators: [PasswordValidator.passwordMatchValidator],
      }
    );
  }

  public submitEmailForm(): void {
    this.submitted = true;

    if (this.emailForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.userService.getPasswordToken(this.emailForm.value).subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Veuillez vérifier l'adresse email");
        },
      })
    );
  }

  public submitResetForm(): void {
    this.submitted = true;

    const passwordFormValue = {
      ...this.resetForm.value,
      userId: parseInt(this.resetForm.controls?.userId?.value, 10),
    };

    if (passwordFormValue) {
      this.subscription.add(
        this.userService.resetPassword(this.resetForm.value).subscribe(() => {
          this.success = true;
        })
      );
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
