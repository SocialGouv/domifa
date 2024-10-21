import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";

import type { PortailUsagerAuthLoginForm } from "../../../../_common";
import { UsagerAuthService } from "../services/usager-auth.service";
import { PasswordValidator } from "./password-validator.service";
import { CustomToastService } from "../../shared/services/custom-toast.service";
import { Subscription } from "rxjs";
import { MatomoTracker } from "ngx-matomo-client";
import {
  PortailUsagerProfile,
  PortailUsagerAuthApiResponse,
} from "@domifa/common";

@Component({
  selector: "app-usager-login",
  styleUrls: ["./usager-login.component.scss"],
  templateUrl: "./usager-login.component.html",
})
export class UsagerLoginComponent implements OnInit, OnDestroy {
  public loginForm!: UntypedFormGroup;

  public hidePassword: boolean;
  public hidePasswordNew: boolean;
  public displayPasswordIndication: boolean;

  public loading: boolean;
  public usagerProfile: PortailUsagerProfile | null;
  public mode: "login-only" | "login-change-password" = "login-only";
  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: UsagerAuthService,
    private readonly toastr: CustomToastService,
    private readonly usagerAuthService: UsagerAuthService,
    public matomo: MatomoTracker,
  ) {
    this.hidePassword = true;
    this.hidePasswordNew = true;
    this.displayPasswordIndication = false;
    this.loading = false;
    this.usagerProfile = null;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Connexion à Mon DomiFa");

    this.subscription.add(
      this.usagerAuthService.currentUsagerSubject.subscribe(
        (apiResponse: PortailUsagerProfile | null) => {
          this.usagerProfile = apiResponse;
          if (apiResponse !== null) {
            this.router.navigate(["/account"]);
          } else {
            this.initForm();
          }
        },
      ),
    );
  }

  public initForm(): void {
    this.loginForm = this.formBuilder.group(
      {
        password: ["", [Validators.minLength(8), Validators.required]],
        login: ["", [Validators.required]],
        newPassword: [
          { value: "", disabled: true },
          Validators.compose([
            Validators.required,
            PasswordValidator.patternValidator(/\d/, {
              hasNumber: true,
            }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true,
            }),
            PasswordValidator.patternValidator(/[a-z]/, {
              hasLowerCase: true,
            }),
            PasswordValidator.patternValidator(
              // eslint-disable-next-line no-useless-escape
              /[@\[\]^_!"#$%&'()*+,\-./:;{}<>=|~?]/,
              {
                hasSpecialCharacter: true,
              },
            ),
            Validators.minLength(12),
            Validators.maxLength(150),
          ]),
        ],
        newPasswordConfirm: [
          { value: "", disabled: true },
          Validators.compose([Validators.required, Validators.minLength(8)]),
        ],
        acceptTerms: [{ value: false, disabled: true }, [Validators.required]],
      },
      {
        validators: [
          PasswordValidator.fieldsNotEqualsValidator({
            ctrl1Name: "password",
            ctrl2Name: "newPassword",
            errName: "new-password-same-as-temporary-password",
          }),
          PasswordValidator.fieldsEqualsValidator({
            ctrl1Name: "newPassword",
            ctrl2Name: "newPasswordConfirm",
            errName: "new-password-confim-does-not-match",
          }),
        ],
      },
    );
  }

  private switchToChangePasswordMode() {
    this.mode = "login-change-password";
    this.loginForm.controls.newPassword.enable();
    this.loginForm.controls.acceptTerms.enable();
    this.loginForm.controls.newPasswordConfirm.enable();
    this.loginForm.updateValueAndValidity();
  }

  public switchToLoginOnly() {
    this.mode = "login-only";
    this.loginForm.controls.newPassword.disable();
    this.loginForm.controls.newPasswordConfirm.disable();
    this.loginForm.controls.newPassword.setValue("");
    this.loginForm.controls.newPasswordConfirm.setValue("");
    this.loginForm.updateValueAndValidity();
  }

  get f(): Record<string, AbstractControl> {
    return this.loginForm.controls;
  }

  public login(): void {
    if (this.loginForm.invalid) {
      this.toastr.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    const loginForm = this.loginForm.value as PortailUsagerAuthLoginForm;
    this.loading = true;

    this.subscription.add(
      this.authService.login(loginForm).subscribe({
        next: (apiAuthResponse: PortailUsagerAuthApiResponse) => {
          this.toastr.success("Connexion réussie !");
          this.authService.saveToken(apiAuthResponse);

          this.loading = false;

          this.matomo.trackEvent(
            "login-portail-usagers",
            "login_success",
            "null",
            1,
          );
          if (!apiAuthResponse.acceptTerms) {
            this.router.navigate(["/account/accept-terms"]);
            return;
          }

          this.router.navigate(["/account"]);
        },

        error: (err) => {
          this.loading = false;
          if (err?.error?.message === "CHANGE_PASSWORD_REQUIRED") {
            this.switchToChangePasswordMode();
            this.matomo.trackEvent(
              "login-portail-usagers",
              "login_success_first_time",
              "null",
              1,
            );
          } else if (err?.error?.message === "TOO_MANY_ATTEMPTS") {
            this.toastr.error(
              "Après plusieurs tentatives de connexion, votre compte est temporairement inaccessible. Veuillez réessayer dans une heure",
            );
          } else {
            this.toastr.error("Login et / ou mot de passe incorrect");
            this.matomo.trackEvent(
              "login-portail-usagers",
              "login_error",
              "null",
              1,
            );
          }
        },
      }),
    );
  }
}
