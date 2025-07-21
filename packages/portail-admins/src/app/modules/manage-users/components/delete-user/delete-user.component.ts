import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CustomToastService } from "../../../shared/services";
import { ManageUsersService } from "../../services/manage-users.service";
import { Subscription } from "rxjs";
import { UserSupervisor } from "@domifa/common";

@Component({
  selector: "app-delete-user",
  templateUrl: "./delete-user.component.html",
  styleUrls: ["./delete-user.component.css"],
})
export class DeleteUserComponent {
  @Input() public selectedUser: UserSupervisor | null;
  @Output() deleteComplete = new EventEmitter<void>();

  public loading: boolean;
  private readonly subscription = new Subscription();

  public newReferrerId: number | null;

  constructor(
    private readonly manageUsersService: ManageUsersService,
    private readonly toastService: CustomToastService
  ) {}

  public deleteUser(): void {
    if (this.selectedUser?.uuid) {
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
}
