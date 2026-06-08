import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  USER_DELETE_MOTIF_LABELS,
  USER_DELETE_MOTIF_VALUES,
  UserDeleteMotif,
  UsersForAdminList,
  UserSupervisor,
  ApiMessage,
} from "@domifa/common";
import { Observable, Subscription } from "rxjs";

import {
  AdminUsersApiClient,
  CustomToastService,
} from "../../../shared/services";
import { ManageUsersService } from "../../services/manage-users.service";
import { ButtonComponent } from "../../../shared/components/button/button.component";

export type DeleteUserTarget =
  | { kind: "supervisor"; user: UserSupervisor }
  | { kind: "structure"; user: UsersForAdminList };

@Component({
  selector: "app-delete-user",
  templateUrl: "./delete-user.component.html",
  styleUrls: ["./delete-user.component.css"],
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
})
export class DeleteUserComponent implements OnChanges {
  @Input() public target: DeleteUserTarget | null = null;
  @Output() deleteComplete = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();

  public loading = false;
  public readonly deleteForm: FormGroup;
  private lastTargetUuid: string | null = null;
  private readonly subscription = new Subscription();

  public readonly motifOptions = USER_DELETE_MOTIF_VALUES.map((key) => ({
    key,
    label: USER_DELETE_MOTIF_LABELS[key],
  }));

  constructor(
    private readonly fb: FormBuilder,
    private readonly manageUsersService: ManageUsersService,
    private readonly adminUsersApi: AdminUsersApiClient,
    private readonly toastService: CustomToastService
  ) {
    this.deleteForm = this.fb.group({
      motif: ["", Validators.required],
      confirmation: ["", [Validators.required, this.nameMatchValidator()]],
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["target"]) {
      // The parent exposes `target` via a getter that allocates a new object on
      // every change-detection cycle, so this hook fires constantly. Only reset
      // the form when the actual user changes, otherwise the input would be
      // cleared on every keystroke.
      const newUuid = this.target?.user.uuid ?? null;
      if (newUuid !== this.lastTargetUuid) {
        this.lastTargetUuid = newUuid;
        this.deleteForm.reset({ motif: "", confirmation: "" });
      }
    }
  }

  public get expectedDeleteName(): string {
    const u = this.target?.user;
    if (!u) {
      return "";
    }
    return `${u.nom} ${u.prenom}`.trim();
  }

  public deleteUser(): void {
    if (this.loading || !this.target?.user.uuid) {
      return;
    }

    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    const motif = this.deleteForm.value.motif as UserDeleteMotif;
    this.loading = true;

    const obs$: Observable<ApiMessage> =
      this.target.kind === "supervisor"
        ? this.manageUsersService.deleteUser(this.target.user.uuid, motif)
        : this.adminUsersApi.deleteStructureUser(
            this.target.user.structureUuid,
            this.target.user.uuid,
            motif
          );

    this.subscription.add(
      obs$.subscribe({
        next: () => {
          this.toastService.success("Utilisateur supprimé avec succès");
          this.deleteComplete.emit();
        },
        error: (error) => {
          this.loading = false;
          // OTP-required errors are handled by the otp.interceptor (it opens
          // the OTP modal and retries the call). Don't display an error toast
          // in that case.
          if (error?.error?.code?.startsWith?.("OTP_")) {
            return;
          }
          this.toastService.error("Impossible de supprimer l'utilisateur");
        },
        complete: () => {
          this.loading = false;
        },
      })
    );
  }

  private nameMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const expected = this.expectedDeleteName.toLowerCase();
      const value = (control.value ?? "").toString().trim().toLowerCase();
      if (!expected || !value) {
        return null;
      }
      return value === expected ? null : { nameMismatch: true };
    };
  }
}
