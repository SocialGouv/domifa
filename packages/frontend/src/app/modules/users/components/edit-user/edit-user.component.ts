import { noWhiteSpace } from "./../../../../shared/validators/whitespace.validator";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { regexp } from "src/app/shared/constants/REGEXP.const";
import {
  FormEmailTakenValidator,
  UsagerLight,
  UserStructure,
} from "../../../../../_common/model";
import { userStructureBuilder } from "../../services";
import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";
import { format } from "date-fns";

@Component({
  selector: "app-edit-user",
  templateUrl: "./edit-user.component.html",
  styleUrls: ["./edit-user.component.css"],
})
export class EditUserComponent implements OnInit {
  public me!: UserStructure | null;

  public submitted: boolean;
  public loading: boolean;

  public editUser: boolean;
  public editPassword: boolean;

  public hideOldPassword: boolean;
  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;

  public lastPasswordUpdate: string;
  public usagers$: Observable<UsagerLight[]>;

  public passwordForm!: FormGroup;
  public userForm!: FormGroup;

  public emailExist: boolean;

  get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  get p(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: FormBuilder,
    private readonly titleService: Title
  ) {
    this.submitted = false;
    this.editPassword = false;
    this.editUser = false;

    this.hideOldPassword = true;
    this.hidePassword = true;
    this.hidePasswordConfirm = true;

    this.emailExist = false;
    this.loading = false;
    this.usagers$ = of([]);

    this.lastPasswordUpdate = "Aucune modification de mot de passe enregistrée";
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Editer mes informations");

    this.me = this.authService.currentUserValue;

    this.getLastPasswordUpdate();

    if (this.me?.role !== "facteur") {
      this.usagers$ = this.userService.agenda();
    }
  }

  public initUserForm(): void {
    this.editUser = true;

    this.userForm = this.formBuilder.group({
      email: [
        this.me?.email,
        [Validators.pattern(regexp.email), Validators.required],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [
        this.me?.nom,
        [Validators.required, Validators.minLength(2), noWhiteSpace],
      ],
      prenom: [
        this.me?.prenom,
        [Validators.required, Validators.minLength(2), noWhiteSpace],
      ],
    });
  }

  public initPasswordForm(): void {
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
        validators: PasswordValidator.passwordMatchValidator,
      }
    );
  }

  private getLastPasswordUpdate(): void {
    this.userService.getLastPasswordUpdate().subscribe({
      next: (lastPassword: Date | null) => {
        this.lastPasswordUpdate =
          lastPassword === null
            ? "Aucune modification de mot de passe enregistrée"
            : "Dernière modification: " +
              format(new Date(lastPassword), "dd/MM/yyyy");
      },
    });
  }

  public updateUser(): void {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }
    this.loading = true;
    this.userService.patch(this.userForm.value).subscribe({
      next: (user: UserStructure) => {
        this.loading = false;
        this.me = userStructureBuilder.buildUserStructure(user);
        this.editUser = false;
        this.toastService.success(
          "Félicitations : vos informations ont été modifiées avec succès"
        );
      },
      error: () => {
        this.loading = false;
        this.toastService.error(
          "Veuillez vérifier les champs marqués en rouge dans le formulaire"
        );
      },
    });
  }

  public updateMyPassword(): void {
    this.submitted = true;
    if (this.passwordForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    this.loading = true;
    this.userService.updateMyPassword(this.passwordForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.editPassword = false;
        this.submitted = false;
        this.getLastPasswordUpdate();
        this.toastService.success(
          "Félicitations ! : votre mot de passe a été modifié avec succès"
        );
      },
      error: () => {
        this.loading = false;
        this.toastService.error(
          "Une erreur est survenue, veuillez vérifier le formulaire"
        );
      },
    });
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public togglePasswordConfirmation(): void {
    this.hidePasswordConfirm = !this.hidePasswordConfirm;
  }

  public toggleOldPassword(): void {
    this.hideOldPassword = !this.hideOldPassword;
  }

  public validateEmailNotTaken(
    control: AbstractControl
  ): FormEmailTakenValidator {
    if (control.value === this.me?.email) {
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
