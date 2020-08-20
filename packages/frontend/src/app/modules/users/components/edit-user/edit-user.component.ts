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
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { Usager } from "src/app/modules/usagers/interfaces/usager";

@Component({
  selector: "app-edit-user",
  templateUrl: "./edit-user.component.html",
  styleUrls: ["./edit-user.component.css"],
})
export class EditUserComponent implements OnInit {
  public me: User | null;
  public usagers: Usager[];

  public submitted: boolean;
  public success: boolean;

  public editUser: boolean;
  public editPassword: boolean;

  public hideOldPassword: boolean;
  public hidePassword: boolean;
  public hideConfirmPassword: boolean;

  public passwordForm!: FormGroup;
  public userForm!: FormGroup;

  public emailExist: boolean;

  get f() {
    return this.userForm.controls;
  }

  get p() {
    return this.passwordForm.controls;
  }

  constructor(
    public authService: AuthService,
    public userService: UsersService,

    public router: Router,
    public notifService: ToastrService,
    public formBuilder: FormBuilder,
    public titleService: Title
  ) {
    this.submitted = false;
    this.success = false;
    this.editPassword = false;
    this.editUser = false;

    this.hideOldPassword = true;
    this.hidePassword = true;
    this.hideConfirmPassword = true;

    this.emailExist = false;
    this.usagers = [];
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Editer mes informations");

    this.authService.currentUser.subscribe((user) => {
      this.me = user;

      this.userService.agenda().subscribe((usagers: Usager[]) => {
        this.usagers = usagers;
      });
    });
  }

  public initUserForm() {
    this.editUser = true;

    this.userForm = this.formBuilder.group({
      email: [
        this.me.email,
        [Validators.pattern(regexp.email), Validators.required],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [this.me.nom, Validators.required],
      prenom: [this.me.prenom, Validators.required],
    });
  }

  public initPasswordForm() {
    this.editPassword = true;

    this.passwordForm = this.formBuilder.group(
      {
        oldPassword: [
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
          this.me = new User(user);
          this.editUser = false;
          this.notifService.success(
            "Vos informations ont été modifiées avec succès",
            "Félicitations !"
          );
        },
        () => {
          this.notifService.error(
            "Veuillez vérifier les champs marqués en rouge dans le formulaire",
            "Erreur dans le formulaire"
          );
        }
      );
    }
  }

  public updatePassword() {
    if (!this.passwordForm.invalid) {
      this.userService.updatePassword(this.passwordForm.value).subscribe(
        (user: any) => {
          this.editPassword = false;
          this.me.passwordLastUpdate = new Date();
          this.notifService.success(
            "Votre mot de passe a été modifié avec succès",
            "Félicitations !"
          );
        },
        (error: any) => {
          this.notifService.error(error.message, "Erreur dans le formulaire");
        }
      );
    }
  }

  public validateEmailNotTaken(control: AbstractControl) {
    if (control.value === this.me.email) {
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
