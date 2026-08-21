import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PortailAdminAuthApiResponse } from "@domifa/common";
import { regexp } from "../../../shared/utils/validators";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { ButtonComponent } from "../../../shared/components/button/button.component";
import { PortailStatsAuthLoginForm } from "../../types";
import { PortailStatsAuthService } from "../../services/portail-stats-auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
})
export class LoginComponent implements OnInit {
  public loginForm!: UntypedFormGroup;

  public hidePassword: boolean;
  public loading: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly authService: PortailStatsAuthService,
    private readonly toastr: CustomToastService
  ) {
    this.hidePassword = true;
    this.loading = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Connexion à l'outil de pilotage de DomiFa");
    this.initForm();
  }

  public initForm(): void {
    this.loginForm = this.formBuilder.group({
      password: ["", Validators.required],
      email: ["", [Validators.pattern(regexp.email), Validators.required]],
    });
  }

  get f(): Record<string, AbstractControl> {
    return this.loginForm.controls;
  }

  public toggleShowPassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public login(): void {
    if (this.loginForm.invalid) {
      this.toastr.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    const loginForm = this.loginForm.value as PortailStatsAuthLoginForm;
    this.loading = true;

    this.authService.login(loginForm).subscribe({
      error: (err) => {
        this.loading = false;
        if (err?.error?.message === "BLOCKED_TEMP") {
          this.toastr.error(
            "Compte temporairement bloqué (trop de tentatives). Réessayez dans 1h ou réinitialisez votre mot de passe."
          );
        } else {
          this.toastr.error("Login et / ou mot de passe incorrect");
        }
      },
      next: (apiAuthResponse: PortailAdminAuthApiResponse) => {
        this.toastr.success("Connexion réussie");
        this.authService.saveToken(apiAuthResponse);
        this.loading = false;

        const redirectToAfterLogin =
          this.route.snapshot.queryParams.redirectToAfterLogin;

        if (redirectToAfterLogin) {
          this.router.navigateByUrl(redirectToAfterLogin);
        } else {
          this.router.navigate(["/stats"]);
        }
      },
    });
  }
}
