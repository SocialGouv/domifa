import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import type { AuthLoginForm } from "../../../../_common/auth/AuthLoginForm.type";
import { UsagerAuthService } from "../services/usager-auth.service";

@Component({
  selector: "app-usager-login",
  styleUrls: ["./usager-login.component.css"],
  templateUrl: "./usager-login.component.html",
})
export class UsagerLoginComponent implements OnInit {
  public loginForm!: FormGroup;

  public userForm!: FormGroup;

  public hidePassword: boolean;

  public loading: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private titleService: Title,
    private authService: UsagerAuthService,
    private toastr: ToastrService
  ) {
    this.hidePassword = true;
    this.loading = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Connexion à DomiFa");
    this.initForm();
  }

  public initForm(): void {
    this.loginForm = this.formBuilder.group({
      password: ["", Validators.required],
      usagerAuthId: ["", [Validators.required]],
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

    const loginForm = this.loginForm.value as AuthLoginForm;
    this.loading = true;

    this.authService.login(loginForm).subscribe({
      complete: () => {
        console.log("Observer got a complete notification");
      },
      error: () => {
        this.loading = false;
        this.toastr.error("Email et / ou mot de passe incorrect");
      },
      next: () => {
        this.loading = false;
        this.router.navigate(["/"]);
      },
    });
  }
}
