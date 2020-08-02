import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsersService } from "../../services/users.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { User } from "../../interfaces/user";
import { regexp } from "src/app/shared/validators";
import { PasswordValidator } from "../../services/password-validator.service";
import { map } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-edit-user",
  templateUrl: "./edit-user.component.html",
  styleUrls: ["./edit-user.component.css"],
})
export class EditUserComponent implements OnInit {
  public user: User | null;

  public submitted: boolean;
  public success: boolean;

  public editUser: boolean;
  public editPassword: boolean;
  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;

  public resetForm!: FormGroup;
  public userForm!: FormGroup;

  public emailExist: boolean;

  get f() {
    return this.userForm.controls;
  }

  constructor(
    private authenticationService: AuthService,
    public userService: UsersService,
    public router: Router,
    public notifService: ToastrService,
    public formBuilder: FormBuilder,
    public titleService: Title
  ) {
    this.user = new User({});

    this.submitted = false;
    this.success = false;
    this.editPassword = false;
    this.editUser = false;
    this.hidePassword = false;
    this.hidePasswordConfirm = false;
    this.emailExist = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Editer mes informations");
  }

  public initUserForm() {
    this.editUser = true;
    this.user = this.authenticationService.currentUserValue;
    this.userForm = this.formBuilder.group({
      email: [
        this.user.email,
        [Validators.pattern(regexp.email), Validators.required],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [this.user.nom, Validators.required],
      prenom: [this.user.prenom, Validators.required],
    });
  }

  public initPasswordForm() {
    this.resetForm = this.formBuilder.group(
      {
        confirmPassword: [null, Validators.compose([Validators.required])],
        password: [
          null,
          Validators.compose([
            Validators.required,
            PasswordValidator.patternValidator(/\d/, {
              hasNumber: true,
            }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true,
            }),
            Validators.minLength(12),
          ]),
        ],
      },
      {
        validator: PasswordValidator.passwordMatchValidator,
      }
    );
  }

  public updateUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire",
        "Erreur dans le formulaire"
      );
    } else {
      this.userService.patch(this.userForm.value).subscribe(
        (user: User) => {
          this.user = new User(user);
          this.editUser = false;
          this.notifService.success(
            "Vos informations ont été modifiées avec succès",
            "Féliciations !"
          );
        },
        () => {
          this.notifService.error(
            "veuillez vérifier les champs marqués en rouge dans le formulaire",
            "Erreur dans le formulaire"
          );
        }
      );
    }
  }

  public submitResetForm() {
    this.submitted = true;
    if (!this.resetForm.invalid) {
      this.userService
        .resetPassword(this.resetForm.value)
        .subscribe((user: any) => {
          this.success = true;
        });
    }
  }

  public validateEmailNotTaken(control: AbstractControl) {
    if (control.value === this.user.email) {
      return of(null);
    }
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.userService.validateEmail(control.value).pipe(
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }
}
