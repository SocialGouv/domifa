import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { regexp } from "src/app/shared/validators";

import { ToastrService } from "ngx-toastr";
import { Title } from "@angular/platform-browser";
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
  public loading: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
    private notifService: ToastrService
  ) {
    this.hidePassword = true;
    this.loading = false;
    this.returnUrl = "/";
  }

  public ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || "/";

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

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public login() {
    if (this.loginForm.invalid) {
      this.notifService.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    this.loading = true;

    this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        () => {
          this.loading = false;

          return this.returnUrl !== "/"
            ? this.router.navigateByUrl(this.returnUrl)
            : this.router.navigate(["/manage"]);
        },
        () => {
          this.loading = false;
          this.notifService.error("Email et / ou mot de passe incorrect");
        }
      );
  }
}
