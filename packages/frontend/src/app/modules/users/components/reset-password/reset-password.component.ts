import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { fadeInOut } from "../../../../shared/animations";
import { User } from "../../interfaces/user";
import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";

@Component({
  animations: [fadeInOut],
  selector: "app-reset-password",
  styleUrls: ["./reset-password.component.css"],
  templateUrl: "./reset-password.component.html"
})
export class ResetPasswordComponent implements OnInit {
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

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

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
    private router: Router
  ) {}

  public ngOnInit() {
    this.title = "Mot de passe oublié ?";
    this.token = undefined;
    this.hidePassword = true;
    this.hidePasswordConfirm = true;

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
            error.message === "TOKEN_EXPIRED"
              ? "La procédure de renouvellement de votre mot de passe a expiré, veuillez renouveler votre demande"
              : "Le lien est incorrect, veuillez recommencer la procédure";
          this.changeSuccessMessage(this.errorMessage, true);
          this.initEmailForm();
        }
      );
    } else {
      this.initEmailForm();
    }

    this.successSubject.subscribe(message => {
      this.successMessage = message;
      this.errorMessage = null;
    });

    this.errorSubject.subscribe(message => {
      this.errorMessage = message;
      this.successMessage = null;
    });

    this.successSubject
      .pipe(debounceTime(10000))
      .subscribe(() => (this.successMessage = null));
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
            error.message === "EMAIL_NOT_EXIST"
              ? "Veuillez vérifier l'adresse email"
              : "Une erreur innatendue est survenue";
          this.changeSuccessMessage(this.errorMessage, true);
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

  public changeSuccessMessage(message: string, erreur?: boolean) {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
    erreur
      ? this.errorSubject.next(message)
      : this.successSubject.next(message);
  }
}
