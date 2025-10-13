import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";

import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
  UserSupervisorRole,
} from "@domifa/common";
import { ManageUsersService } from "../../services/manage-users.service";

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
  private readonly subscription = new Subscription();
  private readonly unsubscribe: Subject<void> = new Subject();

  public selectedRole: UserSupervisorRole = "national";
  public showTerritories = false;
  public territoriesList: RegionsLabels = DEPARTEMENTS_LISTE;

  @Input() public userToEdit: UserSupervisor | null = null;
  @Input() public isEditMode = false;

  @Output() public readonly cancel = new EventEmitter<void>();
  @Output() public readonly getUsers = new EventEmitter<void>();

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

    if (!this.isEditMode) {
      this.f.territories.setValue(null);
    }
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
      this.f.territories.setValue(null);
    }

    this.f.territories.updateValueAndValidity();
  }

  private patchFormWithUserData(): void {
    if (!this.userToEdit) return;

    const territory =
      this.userToEdit?.territories?.length > 0
        ? this.userToEdit.territories[0]
        : null;

    this.userForm.patchValue({
      prenom: this.userToEdit.prenom,
      nom: this.userToEdit.nom,
      email: this.userToEdit.email,
      role: this.userToEdit.role,
      territories: territory,
    });

    if (this.isEditMode) {
      this.f.email.disable();
    }
    this.selectedRole = this.userToEdit.role;
    this.onRoleChange();
  }

  ngOnInit(): void {
    this.initForm();

    if (this.isEditMode && this.userToEdit) {
      this.onRoleChange();
      this.patchFormWithUserData();
    }
  }

  private initForm(): void {
    this.userForm = this.formBuilder.group({
      email: [
        null,
        [Validators.required, EmailValidator, this.SuperAdminEmailValidator()],
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
      territories: [null, []],
    });

    this.userForm.get("role").valueChanges.subscribe(() => {
      this.userForm.get("email").updateValueAndValidity();
    });
  }

  public SuperAdminEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const email = control.value;
      const roleControl = control.parent.get("role");

      if (!roleControl?.value) {
        return null;
      }

      const role = roleControl.value;

      if (role === "super-admin-domifa" && email) {
        if (!email.endsWith("@fabrique.social.gouv.fr")) {
          return { invalidSuperAdminEmail: true };
        }
      }

      return null;
    };
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
      if (this.isEditMode && this.userToEdit) {
        this.subscription.add(
          this.manageUsersService
            .updateUser(this.userToEdit.uuid, formValue)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
              next: () => {
                this.toastService.success("Utilisateur mis à jour avec succès");
                this.resetForm();
                this.getUsers.emit();
                this.cancel.emit();
              },
              error: (error) => {
                this.loading = false;
                if (error.status === 409) {
                  this.emailExist = true;
                } else {
                  this.toastService.error(
                    "Erreur lors de la mise à jour de l'utilisateur"
                  );
                }
              },
            })
        );
      } else {
        this.subscription.add(
          this.manageUsersService.registerUserSupervisor(formValue).subscribe({
            next: () => {
              this.loading = false;
              this.submitted = false;
              this.getUsers.emit();
              this.userForm.reset();
              this.cancel.emit();
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
  }

  private resetForm(): void {
    this.submitted = false;
    this.loading = false;
    this.emailExist = false;
    this.userForm.reset({ role: "national" });
    this.selectedRole = "national";
    this.onRoleChange();
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
