import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  RegionDepartmentUser,
  USER_DELETE_MOTIF_LABELS,
  UserDeleteMotif,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../shared/services";
import { RegionUsersService } from "../../services/region-users.service";

// Motifs that make sense for a DREETS removing a DDETS agent
const DDETS_DELETE_MOTIFS: UserDeleteMotif[] = [
  "DEPART_STRUCTURE",
  "INACTIF_PLUS_D_UN_AN",
  "EMAIL_GENERIQUE",
];

@Component({
  selector: "app-delete-department-user",
  templateUrl: "./delete-department-user.component.html",
  standalone: false,
})
export class DeleteDepartmentUserComponent implements OnDestroy {
  @Input({ required: true }) public user!: RegionDepartmentUser;
  @Output() public readonly deleted = new EventEmitter<void>();
  @Output() public readonly cancelAction = new EventEmitter<void>();

  public readonly motifOptions = DDETS_DELETE_MOTIFS.map((key) => ({
    key,
    label:
      key === "DEPART_STRUCTURE"
        ? "Ne travaille plus à la DDETS"
        : USER_DELETE_MOTIF_LABELS[key],
  }));

  public readonly motif = new FormControl<UserDeleteMotif | "">("", {
    nonNullable: true,
    validators: [Validators.required],
  });

  public readonly deleteForm = new FormGroup({ motif: this.motif });
  public loading = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly regionUsersService: RegionUsersService,
    private readonly toastService: CustomToastService
  ) {}

  public deleteUser(): void {
    if (this.loading) {
      return;
    }
    if (this.motif.invalid) {
      this.motif.markAsTouched();
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.regionUsersService
        .deleteUser(this.user.uuid, this.motif.value as UserDeleteMotif)
        .subscribe({
          next: () => {
            this.loading = false;
            this.motif.reset();
            this.toastService.success("Utilisateur supprimé avec succès");
            this.deleted.emit();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible de supprimer l'utilisateur");
          },
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
