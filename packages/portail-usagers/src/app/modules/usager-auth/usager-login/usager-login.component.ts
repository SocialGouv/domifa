import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { UsagerAuthService } from "../services/usager-auth.service";
import { AuthLoginForm } from "../../../../_common/auth/AuthLoginForm.type";

@Component({
  selector: "app-usager-login",
  templateUrl: "./usager-login.component.html",
  styleUrls: ["./usager-login.component.css"],
})
export class UsagerLoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public userForm!: FormGroup;

  public hidePassword: boolean;
  public loading: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: UsagerAuthService,
    private toastr: ToastrService
  ) {
    this.hidePassword = true;
    this.loading = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Connexion à DomiFa");
    this.initForm();
  }

  public initForm() {
    this.loginForm = this.formBuilder.group({
      usagerAuthId: ["", [Validators.required]],
      password: ["", Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  public login() {
    if (this.loginForm.invalid) {
      this.toastr.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    const loginForm = this.loginForm.value as AuthLoginForm;
    this.loading = true;

    this.authService.login(loginForm).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/"]);
      },
      error: () => {
        this.loading = false;
        this.toastr.error("Email et / ou mot de passe incorrect");
      },
      complete: () => console.log("Observer got a complete notification"),
    });
  }
}
