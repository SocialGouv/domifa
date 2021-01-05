import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { regexp } from "src/app/shared/validators";

import { ToastrService } from "ngx-toastr";
import { Title } from "@angular/platform-browser";
import { AppUser } from "../../../../../_common/model";
@Component({
  selector: "app-login",
  styleUrls: ["./login.component.css"],
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public userForm!: FormGroup;

  public returnUrl: string;

  public hidePassword: boolean;
  public successMessage: string;
  public success: boolean;
  public error: boolean;
  public loading: boolean;
  public errorMessage: string;
  public errorLabels: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
    private notifService: ToastrService
  ) {
    this.errorMessage = "";
    this.successMessage = "";
    this.hidePassword = true;
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || "/";
    this.success = false;
    this.error = false;
    this.loading = false;
    this.errorLabels = {
      ACCOUNT_NOT_ACTIVATED: "Compte non activé par l'administrateur",
      WRONG_CREDENTIALS: "Email et / ou mot de passe incorrect",
    };
  }

  public ngOnInit() {
    this.titleService.setTitle("Connexion à DomiFa");
    this.initForm();
  }

  public initForm() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.pattern(regexp.email), Validators.required]],
      password: ["", Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  public login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        (user: AppUser) => {
          this.loading = false;
          this.success = true;
          this.error = true;

          return this.returnUrl !== "/"
            ? this.router.navigateByUrl(this.returnUrl)
            : this.router.navigate(["/manage"]);
        },
        (error) => {
          this.loading = false;
          this.error = true;
          this.success = false;
          this.notifService.error(this.errorLabels[error.message]);
        }
      );
  }
}
