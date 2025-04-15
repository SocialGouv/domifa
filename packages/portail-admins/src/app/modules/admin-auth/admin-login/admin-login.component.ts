import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { regexp } from "../../../shared/utils/validators";
import { CustomToastService } from "../../shared/services/custom-toast.service";
import { PortailAdminAuthLoginForm } from "../model";
import { AdminAuthService } from "../services/admin-auth.service";
import { PortailAdminAuthApiResponse } from "@domifa/common";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
})
export class AdminLoginComponent implements OnInit {
  public loginForm!: UntypedFormGroup;

  public userForm!: UntypedFormGroup;

  public hidePassword: boolean;
  public loading: boolean;

  private redirectToAfterLogin?: string;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AdminAuthService,
    private readonly toastr: CustomToastService
  ) {
    this.hidePassword = true;
    this.loading = false;
  }

  public ngOnInit(): void {
    this.redirectToAfterLogin =
      this.route.snapshot.queryParams.redirectToAfterLogin;
    this.titleService.setTitle("Connexion à DomiFa");
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
        if (this.redirectToAfterLogin) {
          this.router.navigateByUrl(this.redirectToAfterLogin);
        } else {
          this.router.navigate(["/structures/rapports"]);
        }
      },
    });
  }
}
