import { noWhiteSpace } from "../../../../shared/validators/whitespace.validator";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Observable, of, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";

import {
  FormEmailTakenValidator,
  UsagerLight,
  UserStructure,
} from "../../../../../_common/model";
import { PasswordValidator, userStructureBuilder } from "../../services";
import { UsersService } from "../../services/users.service";
import { format } from "date-fns";
import { PASSWORD_VALIDATOR } from "../../PASSWORD_VALIDATOR.const";

@Component({
  selector: "app-edit-user",
  templateUrl: "./edit-user.component.html",
  styleUrls: ["./edit-user.component.css"],
})
export class EditUserComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;

  public submitted: boolean;
  public loading: boolean;

  public editUser: boolean;
  public editPassword: boolean;

  public hideOldPassword: boolean;

  public lastPasswordUpdate: string;
  public usagers$: Observable<UsagerLight[]>;

  public passwordForm!: UntypedFormGroup;
  public userForm!: UntypedFormGroup;

  public emailExist: boolean;

  private subscription = new Subscription();
  private unsubscribe: Subject<void> = new Subject();

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  public get p(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly titleService: Title
  ) {
    this.submitted = false;
    this.editPassword = false;
    this.editUser = false;

    this.hideOldPassword = true;

    this.emailExist = false;
    this.loading = false;
    this.usagers$ = of([]);

    this.lastPasswordUpdate = "Aucune modification de mot de passe enregistrée";
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Editer mes informations - DomiFa");

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
        [Validators.email, Validators.required],
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
        oldPassword: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        passwordConfirmation: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        password: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
      },
      {
        validators: [PasswordValidator.passwordMatchValidator],
      }
    );
  }

  private getLastPasswordUpdate(): void {
    this.subscription.add(
      this.userService.getLastPasswordUpdate().subscribe({
        next: (lastPassword: Date | null) => {
          this.lastPasswordUpdate =
            lastPassword === null
              ? "Aucune modification de mot de passe enregistrée"
              : "Dernière modification: " +
                format(new Date(lastPassword), "dd/MM/yyyy");
        },
      })
    );
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
    this.subscription.add(
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
      })
    );
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

    this.subscription.add(
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
      })
    );
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
    return Validators.email(control)
      ? this.userService.validateEmail(control.value).pipe(
          takeUntil(this.unsubscribe),
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.subscription.unsubscribe();
  }
}
