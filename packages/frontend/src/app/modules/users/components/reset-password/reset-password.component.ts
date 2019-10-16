import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { ERROR_LABELS } from "../../../../shared/errors.labels";

import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-reset-password",
  styleUrls: ["./reset-password.component.css"],
  templateUrl: "./reset-password.component.html"
})
export class ResetPasswordComponent implements OnInit {
  get e() {
    return this.emailForm.controls;
  }

  get f() {
    return this.resetForm.controls;
  }
  public title: string;

  public emailForm: FormGroup;
  public resetForm: FormGroup;

  public submitted: boolean;
  public success: boolean;
  public error: boolean;

  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;
  public successMessage: string;
  public errorMessage: string;
  public token: string;
  public errorLabels: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private route: ActivatedRoute,
    private notifService: ToastrService
  ) {}

  public ngOnInit() {
    this.title = "Mot de passe oublié ?";
    this.token = undefined;
    this.hidePassword = true;
    this.hidePasswordConfirm = true;
    this.errorLabels = ERROR_LABELS;

    if (this.route.snapshot.params.token) {
      const token = this.route.snapshot.params.token;
      this.userService.checkPasswordToken(token).subscribe(
        response => {
          this.token = token;
          this.initPasswordForm();
        },
        error => {
          this.error = true;
          this.errorMessage =
            (error.error.message === this.errorLabels[error.error.message]) !==
            undefined
              ? this.errorLabels[error.error.message]
              : "Le lien est incorrect, veuillez recommencer la procédure";
          this.notifService.error(this.errorMessage);
        }
      );
    }
    this.initEmailForm();
  }

  public initEmailForm() {
    this.emailForm = this.formBuilder.group({
      email: [null, [Validators.email, Validators.required]]
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
              hasNumber: true
            }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }),
            Validators.minLength(12)
          ])
        ],
        token: [this.token, Validators.required]
      },
      {
        validator: PasswordValidator.passwordMatchValidator
      }
    );
  }

  public submitEmailForm() {
    this.submitted = true;
    if (!this.emailForm.invalid) {
      this.userService.getPasswordToken(this.emailForm.value).subscribe(
        (user: any) => {
          this.success = true;
          this.error = false;
        },
        error => {
          this.error = true;
          this.errorMessage =
            error.error.message === "EMAIL_NOT_EXIST"
              ? "Veuillez vérifier l'adresse email"
              : "Une erreur innatendue est survenue";
          this.notifService.error(this.errorMessage);
        }
      );
    }
  }

  public submitResetForm() {
    this.submitted = true;
    if (!this.resetForm.invalid) {
      this.userService
        .resetPassword(this.resetForm.value)
        .subscribe((user: any) => {
          this.success = true;
        });
    }
  }
}
