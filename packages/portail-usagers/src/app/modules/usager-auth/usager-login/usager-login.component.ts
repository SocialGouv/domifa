import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import type {
  PortailUsagerAuthApiResponse,
  PortailUsagerAuthLoginForm,
} from "../../../../_common";
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
    private toastr: ToastrService,
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
      password: ["86270526", Validators.required],
      login: ["LMUYYGIT", [Validators.required]],
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

    const loginForm = this.loginForm.value as PortailUsagerAuthLoginForm;
    this.loading = true;

    this.authService.login(loginForm).subscribe({
      error: () => {
        this.loading = false;
        this.toastr.error("Login et / ou mot de passe incorrect");
      },
      next: (apiAuthResponse: PortailUsagerAuthApiResponse) => {
        this.toastr.success("Connexion réussie");

        console.log("login");
        console.log(apiAuthResponse);
        // SAVE USER & Tokenn
        this.authService.saveToken(apiAuthResponse);

        this.loading = false;
        this.router.navigate(["/account"]);
      },
    });
  }
}
