import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  DEPARTEMENTS_LISTE,
  getDdetsEmailDomains,
  getRegionDepartmentCodes,
  isDdetsEmail,
  isDdetsEmailForDepartment,
  isDdetsSelfServiceDepartment,
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

type DepartmentOption = {
  code: string;
  label: string;
  selfService: boolean;
};

const DdetsEmailValidator = (
  control: AbstractControl
): ValidationErrors | null =>
  !control.value || isDdetsEmail(control.value)
    ? null
    : { invalidDdetsEmail: true };

// The email domain must be the one of the selected department
const EmailMatchesDepartmentValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const email = group.get("email")?.value;
  const department = group.get("department")?.value;
  if (!email || !department || !isDdetsEmail(email)) {
    return null;
  }
  return isDdetsEmailForDepartment(email, department)
    ? null
    : { emailDomainMismatch: true };
};

const API_ERRORS: Record<string, string> = {
  EMAIL_DOMAIN_MISMATCH:
    "L'adresse email ne correspond pas au domaine du département choisi",
  DEPARTMENT_NOT_SELF_SERVICE:
    "Les comptes de ce département sont créés par l'équipe DomiFa",
  DEPARTMENT_OUTSIDE_REGION: "Ce département n'appartient pas à votre région",
};

@Component({
  selector: "app-register-department-user",
  templateUrl: "./register-department-user.component.html",
  standalone: false,
})
export class RegisterDepartmentUserComponent implements OnDestroy {
  @Output() public readonly registered = new EventEmitter<void>();
  @Output() public readonly cancelAction = new EventEmitter<void>();

  public readonly userForm: FormGroup;
  public readonly departments: DepartmentOption[];
  public readonly hasSelfServiceDepartment: boolean;
  public submitted = false;
  public loading = false;
  public emailExist = false;

  private readonly subscription = new Subscription();

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  public get expectedDomains(): readonly string[] {
    return getDdetsEmailDomains(this.f.department.value ?? "");
  }

  public get emailInvalid(): boolean {
    return (
      (this.f.email.dirty || this.submitted) &&
      (!!this.f.email.errors || !!this.userForm.errors?.emailDomainMismatch)
    );
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
        selfService: isDdetsSelfServiceDepartment(code),
      }));
    this.hasSelfServiceDepartment = this.departments.some((d) => d.selfService);

    this.userForm = this.formBuilder.group(
      {
        nom: [
          "",
          [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
        ],
        prenom: [
          "",
          [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
        ],
        email: ["", [Validators.required, EmailValidator, DdetsEmailValidator]],
        department: [this.defaultDepartment(), Validators.required],
      },
      { validators: EmailMatchesDepartmentValidator }
    );

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
            const message = error?.error?.message;
            if (message === "EMAIL_ALREADY_EXISTS") {
              this.emailExist = true;
              return;
            }
            this.toastService.error(
              API_ERRORS[message] ??
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

  private defaultDepartment(): string {
    const selfService = this.departments.filter((d) => d.selfService);
    return selfService.length === 1 ? selfService[0].code : "";
  }

  private resetForm(): void {
    this.submitted = false;
    this.loading = false;
    this.emailExist = false;
    this.userForm.reset({
      nom: "",
      prenom: "",
      email: "",
      department: this.defaultDepartment(),
    });
  }
}
