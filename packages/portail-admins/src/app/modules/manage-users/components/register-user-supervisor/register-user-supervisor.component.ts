import isEmail from "validator/lib/isEmail";
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { Observable, Subject, Subscription, of } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import {
  EmailValidator,
  fadeInOut,
  NoWhiteSpaceValidator,
} from "../../../../shared";
import { CustomToastService } from "../../../shared/services";

import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  RegionsLabels,
  USER_SUPERVISOR_ROLES_LABELS,
  UserSupervisor,
} from "@domifa/common";
import { ManageUsersService } from "../../services/manage-users.service";
import { UserSupervisorRole } from "@domifa/common";

export type FormEmailTakenValidator = Observable<null | {
  emailTaken: boolean;
}>;

@Component({
  animations: [fadeInOut],
  selector: "app-register-user-supervisor",
  templateUrl: "./register-user-supervisor.component.html",
})
export class RegisterUserSupervisorComponent implements OnInit, OnDestroy {
  public user: UserSupervisor;
  public userForm!: UntypedFormGroup;

  public submitted: boolean;
  public loading: boolean;

  public emailExist = false;

  public readonly USER_SUPERVISOR_ROLES_LABELS = USER_SUPERVISOR_ROLES_LABELS;
  private subscription = new Subscription();
  private unsubscribe: Subject<void> = new Subject();

  public selectedRole: UserSupervisorRole = "national";
  public showTerritories = false;
  public territoriesList: RegionsLabels = DEPARTEMENTS_LISTE;
  @Output() public getUsers = new EventEmitter<void>();

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly manageUsersService: ManageUsersService,
    private readonly toastService: CustomToastService
  ) {
    this.user = null;
    this.loading = false;
    this.submitted = false;
  }

  public onRoleChange(): void {
    this.selectedRole = this.f.role.value;

    this.f.territories.setValue([]);

    if (this.selectedRole === "department") {
      this.showTerritories = true;
      this.territoriesList = DEPARTEMENTS_LISTE;
      this.f.territories.setValidators([Validators.required]);
    } else if (this.selectedRole === "region") {
      this.showTerritories = true;
      this.territoriesList = REGIONS_LISTE;
      this.f.territories.setValidators([Validators.required]);
    } else {
      this.showTerritories = false;
      this.f.territories.clearValidators();
    }

    this.f.territories.updateValueAndValidity();
  }

  public ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      email: [
        null,
        [Validators.required, EmailValidator],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [
        null,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      role: [this.selectedRole, Validators.required],
      prenom: [
        null,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      territories: [[], []],
    });
  }

  public submitUser() {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
    } else {
      let territories = this.userForm.value?.territories ?? [];
      if (territories?.length) {
        territories = [territories];
      }

      const formValue = {
        ...this.userForm.value,
        territories,
      };

      this.loading = true;
      this.subscription.add(
        this.manageUsersService.registerUserSupervisor(formValue).subscribe({
          next: () => {
            this.loading = false;
            this.submitted = false;
            this.getUsers.emit();
            this.userForm.reset();
            this.toastService.success(
              "Le nouveau compte a été créé avec succès, votre collaborateur vient de recevoir un email pour ajouter son mot de passe."
            );
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "veuillez vérifier les champs marqués en rouge dans le formulaire"
            );
          },
        })
      );
    }
  }

  public validateEmailNotTaken(
    control: AbstractControl
  ): FormEmailTakenValidator {
    return isEmail(control.value)
      ? this.manageUsersService.validateUserSuperivorEmail(control.value).pipe(
          takeUntil(this.unsubscribe),
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
