import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import {
  DEPARTEMENTS_LISTE,
  getRegionDepartmentCodes,
  isDdetsEmail,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { PortailStatsAuthService } from "../../../auth/services/portail-stats-auth.service";
import { CustomToastService } from "../../../shared/services";
import {
  EmailValidator,
  NoWhiteSpaceValidator,
} from "../../../shared/validators";
import {
  RegionUsersService,
  RegisterDepartmentUserForm,
} from "../../services/region-users.service";

const DdetsEmailValidator = (
  control: AbstractControl
): ValidationErrors | null =>
  !control.value || isDdetsEmail(control.value)
    ? null
    : { invalidDdetsEmail: true };

@Component({
  selector: "app-register-department-user",
  templateUrl: "./register-department-user.component.html",
  standalone: false,
})
export class RegisterDepartmentUserComponent implements OnDestroy {
  @Output() public readonly registered = new EventEmitter<void>();
  @Output() public readonly cancelAction = new EventEmitter<void>();

  public readonly userForm: FormGroup;
  public readonly departments: { code: string; label: string }[];
  public submitted = false;
  public loading = false;
  public emailExist = false;

  private readonly subscription = new Subscription();

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: PortailStatsAuthService,
    private readonly regionUsersService: RegionUsersService,
    private readonly toastService: CustomToastService
  ) {
    this.departments = getRegionDepartmentCodes(
      this.authService.currentUserValue?.territories ?? []
    )
      .sort()
      .map((code) => ({
        code,
        label: `${code} - ${DEPARTEMENTS_LISTE[code]}`,
      }));

    this.userForm = this.formBuilder.group({
      nom: [
        "",
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      prenom: [
        "",
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      email: ["", [Validators.required, EmailValidator, DdetsEmailValidator]],
      department: [
        this.departments.length === 1 ? this.departments[0].code : "",
        Validators.required,
      ],
    });

    this.subscription.add(
      this.f.email.valueChanges.subscribe(() => (this.emailExist = false))
    );
  }

  public submitUser(): void {
    this.submitted = true;
    if (this.userForm.invalid || this.loading) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.regionUsersService
        .registerUser(this.userForm.value as RegisterDepartmentUserForm)
        .subscribe({
          next: () => {
            this.toastService.success(
              "L'invitation a été envoyée : l'agent va recevoir un email pour choisir son mot de passe."
            );
            this.resetForm();
            this.registered.emit();
          },
          error: (error) => {
            this.loading = false;
            if (error?.error?.message === "EMAIL_ALREADY_EXISTS") {
              this.emailExist = true;
              return;
            }
            this.toastService.error(
              "Impossible de créer cet utilisateur, veuillez vérifier le formulaire"
            );
          },
        })
    );
  }

  public cancel(): void {
    this.resetForm();
    this.cancelAction.emit();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private resetForm(): void {
    this.submitted = false;
    this.loading = false;
    this.emailExist = false;
    this.userForm.reset({
      nom: "",
      prenom: "",
      email: "",
      department: this.departments.length === 1 ? this.departments[0].code : "",
    });
  }
}
