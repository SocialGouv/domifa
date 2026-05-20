import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CustomToastService } from "../../../shared/services";
import { ManageUsersService } from "../../services/manage-users.service";
import { Subscription } from "rxjs";
import { UserSupervisor } from "@domifa/common";
import { ButtonComponent } from "../../../shared/components/button/button.component";

@Component({
  selector: "app-delete-user",
  templateUrl: "./delete-user.component.html",
  styleUrls: ["./delete-user.component.css"],
  imports: [CommonModule, FormsModule, ButtonComponent],
})
export class DeleteUserComponent implements OnChanges {
  @Input() public selectedUser: UserSupervisor | null;
  @Output() deleteComplete = new EventEmitter<void>();

  public loading: boolean;
  public deleteConfirmationInput = "";
  private readonly subscription = new Subscription();

  public newReferrerId: number | null = null;

  constructor(
    private readonly manageUsersService: ManageUsersService,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedUser"]) {
      this.deleteConfirmationInput = "";
    }
  }

  public get expectedDeleteName(): string {
    if (!this.selectedUser) return "";
    return `${this.selectedUser.nom} ${this.selectedUser.prenom}`.trim();
  }

  public get isDeleteNameConfirmed(): boolean {
    return (
      this.deleteConfirmationInput.trim().toLowerCase() ===
      this.expectedDeleteName.toLowerCase()
    );
  }

  public deleteUser(): void {
    if (!this.selectedUser?.uuid || !this.isDeleteNameConfirmed) {
      return;
    }
    this.loading = true;
    this.subscription.add(
      this.manageUsersService.deleteUser(this.selectedUser.uuid).subscribe({
        next: () => {
          this.toastService.success("Utilisateur supprimé avec succès");
          this.deleteComplete.emit();
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible de supprimer l'utilisateur");
        },
        complete: () => {
          this.loading = false;
        },
      })
    );
  }
}
