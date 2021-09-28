import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { UserStructure } from "../../../../../_common/model";
import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-reset-password",
  styleUrls: ["./reset-password.component.css"],
  templateUrl: "./reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit {
  public emailForm!: FormGroup;
  public resetForm!: FormGroup;

  public submitted: boolean;
  public success: boolean;

  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;

  public token?: string;
  public userId?: string;
  public errorLabels: any;

  get e() {
    return this.emailForm.controls;
  }

  get f() {
    return this.resetForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private route: ActivatedRoute,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.success = false;
    this.submitted = false;
    this.hidePassword = true;
    this.hidePasswordConfirm = true;
    this.errorLabels = {
      HARD_RESET_EXPIRED: "Le code a expiré, merci de recommencer la procédure",
      HARD_RESET_INCORRECT_TOKEN:
        "Le code de confirmation inséré est incorrect.",
      TOKEN_EXPIRED:
        "La procédure de renouvellement de votre mot de passe a expiré, veuillez renouveler votre demande",
    };
  }

  public ngOnInit() {
    this.titleService.setTitle("Mot de passe oublié ?");

    if (this.route.snapshot.params.token) {
      const token = this.route.snapshot.params.token;
      const userId = this.route.snapshot.params.userId;
      this.userService.checkPasswordToken({ userId, token }).subscribe({
        next: () => {
          this.token = token;
          this.userId = userId;
          this.initPasswordForm();
        },
        error: (error) => {
          const errorMessage =
            this.errorLabels[error.message] !== undefined
              ? this.errorLabels[error.message]
              : "Le lien est incorrect, veuillez recommencer la procédure";
          this.notifService.error(errorMessage);
        },
      });
    }
    this.initEmailForm();
  }

  public initEmailForm() {
    this.emailForm = this.formBuilder.group({
      email: [null, [Validators.email, Validators.required]],
    });
  }

  public initPasswordForm() {
    this.resetForm = this.formBuilder.group(
      {
        confirmPassword: [null, Validators.compose([Validators.required])],
        password: [
          null,
          Validators.compose([
            Validators.required,
            PasswordValidator.patternValidator(/\d/, {
              hasNumber: true,
            }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true,
            }),
            Validators.minLength(12),
          ]),
        ],
        token: [this.token, Validators.required],
        userId: [this.userId, Validators.required],
      },
      {
        validator: PasswordValidator.passwordMatchValidator,
      }
    );
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public togglePasswordConfirmation(): void {
    this.hidePasswordConfirm = !this.hidePasswordConfirm;
  }

  public submitEmailForm() {
    this.submitted = true;
    if (!this.emailForm.invalid) {
      this.userService.getPasswordToken(this.emailForm.value).subscribe(
        () => {
          this.success = true;
        },
        () => {
          this.notifService.error("Veuillez vérifier l'adresse email");
        }
      );
    }
  }

  public submitResetForm() {
    this.submitted = true;
    if (!this.resetForm.invalid) {
      this.userService.resetPassword(this.resetForm.value).subscribe(() => {
        this.success = true;
      });
    }
  }
}
