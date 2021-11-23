import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import type { PortailAdminAuthApiResponse } from "../../../../_common";
import { PortailAdminAuthLoginForm } from "../model";
import { AdminAuthService } from "../services/admin-auth.service";

@Component({
  selector: "app-admin-login",
  styleUrls: ["./admin-login.component.css"],
  templateUrl: "./admin-login.component.html",
})
export class AdminLoginComponent implements OnInit {
  public loginForm!: FormGroup;

  public userForm!: FormGroup;

  public hidePassword: boolean;

  public loading: boolean;

  private redirectToAfterLogin?: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: AdminAuthService,
    private toastr: ToastrService
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
      login: ["", [Validators.required]],
    });

    // this.loginForm = this.formBuilder.group({
    //   password: ["03634732", Validators.required],
    //   login: ["AABBHAAD", [Validators.required]],
    // });
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

        // SAVE USER & Tokenn
        this.authService.saveToken(apiAuthResponse);

        this.loading = false;
        if (this.route.snapshot.queryParams.redirectToAfterLogin)
          if (this.redirectToAfterLogin) {
            this.router.navigateByUrl(this.redirectToAfterLogin);
          } else {
            this.router.navigate(["/structures"]);
          }
      },
    });
  }
}
