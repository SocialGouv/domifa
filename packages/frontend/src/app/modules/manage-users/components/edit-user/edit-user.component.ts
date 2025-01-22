import isEmail from "validator/lib/isEmail";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Observable, of, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";

import { EmailValidator, NoWhiteSpaceValidator } from "../../../../shared";
import { AuthService, CustomToastService } from "../../../shared/services";
import { UserStructure } from "@domifa/common";
import { format } from "date-fns";
import {
  UsagerLight,
  FormEmailTakenValidator,
} from "../../../../../_common/model";
import { PASSWORD_VALIDATOR } from "../../../users/PASSWORD_VALIDATOR.const";
import {
  UsersService,
  PasswordValidator,
  userStructureBuilder,
} from "../../../users/services";
import { ManageUsersService } from "../../services/manage-users.service";

@Component({
  selector: "app-edit-user",
  templateUrl: "./edit-user.component.html",
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

  @ViewChild("userName")
  public firstInput!: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly manageUsersService: ManageUsersService,
    private readonly usersService: UsersService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly titleService: Title,
    private readonly changeDetectorRef: ChangeDetectorRef
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
    this.titleService.setTitle("Gérer mon compte - DomiFa");

    this.me = this.authService.currentUserValue;

    this.getLastPasswordUpdate();

    if (this.me?.role !== "facteur") {
      this.usagers$ = this.manageUsersService.agenda();
    }
  }

  public initUserForm(): void {
    this.editUser = true;

    this.userForm = this.formBuilder.group({
      email: [
        this.me?.email,
        [Validators.required, EmailValidator],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [
        this.me?.nom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      prenom: [
        this.me?.prenom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
    });

    this.changeDetectorRef.detectChanges();
    const elementToFocus = this.firstInput?.nativeElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }
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
      this.manageUsersService.getLastPasswordUpdate().subscribe({
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
      this.manageUsersService.patch(this.userForm.value).subscribe({
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
      this.manageUsersService
        .updateMyPassword(this.passwordForm.value)
        .subscribe({
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
    if (control?.value === this.me?.email) {
      return of(null);
    }

    return isEmail(control.value)
      ? this.usersService.validateEmail(control.value).pipe(
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
