import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";

import { AuthService } from "../../../shared/services/auth.service";
import { regexp } from "../../../../shared/constants/REGEXP.const";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-login",
  styleUrls: ["./login.component.css"],
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm!: FormGroup;
  public userForm!: FormGroup;

  public returnUrl: string;
  public hidePassword: boolean;
  public loading: boolean;
  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
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

  public initForm() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.pattern(regexp.email), Validators.required]],
      password: ["", Validators.required],
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

            return this.returnUrl !== "/"
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
