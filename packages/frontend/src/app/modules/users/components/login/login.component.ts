import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime, first } from "rxjs/operators";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public returnUrl: string;
  public title: string;
  public userForm: FormGroup;
  public submitted: boolean;
  public hidePassword: boolean;
  public successMessage: string;
  public success: boolean;
  public errorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService
  ) {}

  public ngOnInit() {
    this.title = "Connexion à DomiFa";
    this.successMessage = "";
    this.errorMessage = "";
    this.initForm();
  }

  public initForm() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.email, Validators.required]],
      password: ["", Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  public onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.userService.login(this.f.email.value, this.f.password.value).subscribe(
      data => {
        this.router.navigate([this.returnUrl]);
      },
      error => {
        this.errorMessage = "Login incorrect";
      }
    );
  }
}
