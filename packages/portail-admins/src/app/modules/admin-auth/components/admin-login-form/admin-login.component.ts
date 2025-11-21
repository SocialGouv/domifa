import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { regexp } from "../../../../shared/utils/validators";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { PortailAdminAuthLoginForm } from "../../types";
import { AdminAuthService } from "../../services/admin-auth.service";
import { PortailAdminAuthApiResponse } from "@domifa/common";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
})
export class AdminLoginComponent implements OnInit {
  public loginForm!: UntypedFormGroup;

  public userForm!: UntypedFormGroup;
  public showResetPasswordForm: boolean;
  public hidePassword: boolean;
  public loading: boolean;
  public returnUrl: string;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly authService: AdminAuthService,
    private readonly toastr: CustomToastService
  ) {
    this.hidePassword = true;
    this.loading = false;
    this.showResetPasswordForm = false;
    this.returnUrl = "/";
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Connexion à l'administration de DomiFa");
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || "/";
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

    const loginForm = this.loginForm.value as PortailAdminAuthLoginForm;
    this.loading = true;

    this.authService.login(loginForm).subscribe({
      error: () => {
        this.loading = false;
        this.toastr.error("Login et / ou mot de passe incorrect");
      },
      next: (apiAuthResponse: PortailAdminAuthApiResponse) => {
        this.toastr.success("Connexion réussie");
        this.authService.saveToken(apiAuthResponse);
        this.loading = false;

        const redirectToAfterLogin =
          this.route.snapshot.queryParams.redirectToAfterLogin;

        if (apiAuthResponse.user.role === "super-admin-domifa") {
          if (redirectToAfterLogin) {
            this.router.navigateByUrl(redirectToAfterLogin);
          } else {
            this.router.navigate(["/structure"]);
          }
        } else {
          this.router.navigate(["/stats"]);
        }
      },
    });
  }
}
