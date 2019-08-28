import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime, first } from "rxjs/operators";
import { AuthService } from "src/app/services/auth.service";
import { fadeInOut } from "src/app/shared/animations";
import { UsersService } from "../../services/users.service";

@Component({
  animations: [fadeInOut],
  selector: "app-login",
  styleUrls: ["./login.component.css"],
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public userForm: FormGroup;

  public returnUrl: string;
  public title: string;
  public submitted: boolean;
  public hidePassword: boolean;
  public successMessage: string;
  public success: boolean;
  public errorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    private authService: AuthService
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

  public login() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.f.email.value, this.f.password.value).subscribe(
      user => {
        if (user && user.token) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      },
      error => {
        this.errorMessage = "Login incorrect";
      }
    );
  }
}
