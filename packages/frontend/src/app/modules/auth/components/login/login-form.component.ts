import { LEGACY_PASSWORD_VALIDATOR } from "../../../users/PASSWORD_VALIDATOR.const";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";

import { AuthService } from "../../../shared/services/auth.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { Subscription } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { EmailValidator } from "../../../../shared";

@Component({
  selector: "app-login-form",
  styleUrls: ["./login-form.component.css"],
  templateUrl: "./login-form.component.html",
})
export class LoginFormComponent implements OnInit, OnDestroy {
  public loginForm!: UntypedFormGroup;
  public userForm!: UntypedFormGroup;

  public returnUrl: string;
  public hidePassword: boolean;
  public loading: boolean;
  private readonly subscription = new Subscription();
  public portailUsagerUrl = environment.portailUsagersUrl;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly toastService: CustomToastService
  ) {
    this.hidePassword = true;
    this.loading = false;
    this.returnUrl = "/";
  }

  public ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || "/";
    this.titleService.setTitle("Connexion à DomiFa");
    this.initForm();
  }

  public toggleShowPassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public initForm() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, EmailValidator]],
      password: ["", Validators.compose(LEGACY_PASSWORD_VALIDATOR)],
    });
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public login() {
    if (this.loginForm.invalid) {
      this.toastService.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.authService
        .login(this.f.email.value, this.f.password.value)
        .subscribe({
          next: () => {
            this.loading = false;

            this.returnUrl !== "/"
              ? this.router.navigateByUrl(this.returnUrl)
              : this.router.navigate(["/manage"]);
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Email et ou mot de passe incorrect");
          },
        })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
