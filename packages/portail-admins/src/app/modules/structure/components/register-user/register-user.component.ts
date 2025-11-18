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
import { regexp } from "../../../../shared";
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";

import { Subject, Subscription } from "rxjs";
import {
  AdminStructuresApiClient,
  CustomToastService,
} from "../../../shared/services";

import {
  DEPARTEMENTS_LISTE,
  RegionsLabels,
  USER_FONCTION_LABELS,
  USER_SUPERVISOR_ROLES_LABELS,
  UserStructure,
  UserSupervisorRole,
} from "@domifa/common";
import {
  ApiStructureAdmin,
  StructureAdmin,
} from "../../../admin-structures/types";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  standalone: true,
  selector: "app-register-user",
  templateUrl: "./register-user.component.html",
  imports: [ReactiveFormsModule, CommonModule, SharedModule],
})
export class RegisterUserComponent implements OnInit, OnDestroy {
  public user: UserStructure;
  public newAdminForm!: UntypedFormGroup;

  public submitted: boolean;
  public loading: boolean;

  public emailExist = false;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public readonly USER_SUPERVISOR_ROLES_LABELS = USER_SUPERVISOR_ROLES_LABELS;
  private readonly subscription = new Subscription();
  private readonly unsubscribe: Subject<void> = new Subject();

  public selectedRole: UserSupervisorRole = "national";
  public showTerritories = false;
  public territoriesList: RegionsLabels = DEPARTEMENTS_LISTE;

  @Input() currentStructure?: StructureAdmin | ApiStructureAdmin | undefined =
    undefined;
  @Output() public readonly cancel = new EventEmitter<void>();
  @Output() public readonly getUsers = new EventEmitter<void>();

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  get f(): { [key: string]: AbstractControl } {
    return this.newAdminForm.controls;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly toastService: CustomToastService
  ) {
    this.user = null;
    this.loading = false;
    this.submitted = false;
  }

  public get fonctionFormControl(): AbstractControl {
    return this.newAdminForm.get("fonction");
  }

  public get fonctionDetailControl(): AbstractControl {
    return this.newAdminForm.get("fonctionDetail");
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.newAdminForm = this.formBuilder.group({
      nom: [null, [Validators.required]],
      prenom: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.pattern(regexp.email)]],
      fonction: [null, [Validators.required]],
      fonctionDetail: [
        null,
        [Validators.minLength(2), Validators.maxLength(255)],
      ],
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

  public submitNewAdmin(): void {
    this.submitted = true;

    if (this.newAdminForm.invalid) {
      this.toastService.error("Veuillez vérifier le formulaire");
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.adminStructuresApiClient
        .registerUserStructureAdmin({
          ...this.newAdminForm.value,
          structureId: this.currentStructure?.id,
          structure: this.currentStructure,
          role: "admin",
        })
        .subscribe({
          next: () => {
            this.newAdminForm.reset();
            this.submitted = false;
            this.loading = false;

            this.currentStructure = undefined;
            this.getUsers.emit();
            this.toastService.success("Un email a été envoyé à l'utilisateur.");
          },
          error: () => {
            this.loading = false;
            this.submitted = false;
            this.toastService.error("Une erreur est survenue.");
          },
        })
    );
  }

  public cancelForm(): void {
    this.newAdminForm.reset();
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
