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
  getDreetsEmailDomains,
  getRegionDepartmentCodes,
  isNominativeGouvEmail,
  isDdetsEmailForDepartment,
  isDdetsSelfServiceDepartment,
  isDreetsEmailForRegion,
  isDreetsSelfServiceRegion,
  RegionManagedRole,
  REGIONS_LISTE,
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
  RegisterRegionUserForm,
} from "../../services/region-users.service";

type TerritoryOption = {
  code: string;
  label: string;
  selfService: boolean;
};

const NominativeEmailValidator = (
  control: AbstractControl
): ValidationErrors | null =>
  !control.value || isNominativeGouvEmail(control.value)
    ? null
    : { invalidNominativeEmail: true };

// The email domain must be the one of the selected department or region
const EmailMatchesTerritoryValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const email = group.get("email")?.value;
  const isRegion = group.get("role")?.value === "region";
  const territory = group.get(isRegion ? "region" : "department")?.value;
  if (!email || !territory || !isNominativeGouvEmail(email)) {
    return null;
  }
  const matches = isRegion
    ? isDreetsEmailForRegion(email, territory)
    : isDdetsEmailForDepartment(email, territory);
  return matches ? null : { emailDomainMismatch: true };
};

const API_ERRORS: Record<string, string> = {
  EMAIL_DOMAIN_MISMATCH:
    "L'adresse email ne correspond pas au domaine du territoire choisi",
  DEPARTMENT_NOT_SELF_SERVICE:
    "Les comptes de ce département sont créés par l'équipe DomiFa",
  DEPARTMENT_OUTSIDE_REGION: "Ce département n'appartient pas à votre région",
  REGION_NOT_SELF_SERVICE:
    "Les comptes de cette région sont créés par l'équipe DomiFa",
  REGION_OUTSIDE_SCOPE: "Vous ne pouvez inviter que des agents de votre région",
};

@Component({
  selector: "app-register-region-user",
  templateUrl: "./register-region-user.component.html",
  standalone: false,
})
export class RegisterRegionUserComponent implements OnDestroy {
  @Output() public readonly registered = new EventEmitter<void>();
  @Output() public readonly cancelAction = new EventEmitter<void>();

  public readonly userForm: FormGroup;
  public readonly departments: TerritoryOption[];
  public readonly regions: TerritoryOption[];
  public readonly hasSelfServiceDepartment: boolean;
  public readonly hasSelfServiceRegion: boolean;
  public submitted = false;
  public loading = false;
  public emailExist = false;

  private readonly subscription = new Subscription();

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  public get isRegion(): boolean {
    return this.f.role.value === "region";
  }

  public get hasSelfServiceTerritory(): boolean {
    return this.isRegion
      ? this.hasSelfServiceRegion
      : this.hasSelfServiceDepartment;
  }

  public get expectedDomains(): readonly string[] {
    return this.isRegion
      ? getDreetsEmailDomains(this.f.region.value ?? "")
      : getDdetsEmailDomains(this.f.department.value ?? "");
  }

  public get emailExample(): string {
    return this.isRegion ? "nom@dreets.gouv.fr" : "nom@departement.gouv.fr";
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
    const territories = this.authService.currentUserValue?.territories ?? [];

    this.departments = getRegionDepartmentCodes(territories)
      .sort()
      .map((code) => ({
        code,
        label: `${code} - ${DEPARTEMENTS_LISTE[code]}`,
        selfService: isDdetsSelfServiceDepartment(code),
      }));
    this.regions = [...territories].sort().map((code) => ({
      code,
      label: `${code} - ${REGIONS_LISTE[code]}`,
      selfService: isDreetsSelfServiceRegion(code),
    }));
    this.hasSelfServiceDepartment = this.departments.some((d) => d.selfService);
    this.hasSelfServiceRegion = this.regions.some((r) => r.selfService);

    this.userForm = this.formBuilder.group(
      {
        role: ["department" as RegionManagedRole, Validators.required],
        nom: [
          "",
          [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
        ],
        prenom: [
          "",
          [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
        ],
        email: [
          "",
          [Validators.required, EmailValidator, NominativeEmailValidator],
        ],
        department: [
          this.defaultTerritory(this.departments),
          Validators.required,
        ],
        region: [this.defaultTerritory(this.regions)],
      },
      { validators: EmailMatchesTerritoryValidator }
    );

    this.subscription.add(
      this.f.email.valueChanges.subscribe(() => (this.emailExist = false))
    );
    // Only the territory matching the account type is required
    this.subscription.add(
      this.f.role.valueChanges.subscribe((role: RegionManagedRole) => {
        const [required, optional] =
          role === "region"
            ? [this.f.region, this.f.department]
            : [this.f.department, this.f.region];
        required.setValidators(Validators.required);
        optional.clearValidators();
        required.updateValueAndValidity({ emitEvent: false });
        optional.updateValueAndValidity({ emitEvent: false });
        this.userForm.updateValueAndValidity();
      })
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

    const { role, nom, prenom, email, department, region } =
      this.userForm.value;
    const payload: RegisterRegionUserForm =
      role === "region"
        ? { role, nom, prenom, email, region }
        : { role, nom, prenom, email, department };

    this.loading = true;
    this.subscription.add(
      this.regionUsersService.registerUser(payload).subscribe({
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

  // Auto-select the territory when only one can be chosen
  private defaultTerritory(options: TerritoryOption[]): string {
    const selfService = options.filter((option) => option.selfService);
    return selfService.length === 1 ? selfService[0].code : "";
  }

  private resetForm(): void {
    this.submitted = false;
    this.loading = false;
    this.emailExist = false;
    this.userForm.reset({
      role: "department",
      nom: "",
      prenom: "",
      email: "",
      department: this.defaultTerritory(this.departments),
      region: this.defaultTerritory(this.regions),
    });
  }
}
