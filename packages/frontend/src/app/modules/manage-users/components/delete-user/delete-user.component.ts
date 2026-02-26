import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Usager, UserStructure, UserStructureProfile } from "@domifa/common";
import { CustomToastService } from "../../../shared/services";
import { ManageUsersService } from "../../services/manage-users.service";
import { concatMap, Subscription } from "rxjs";

@Component({
  selector: "app-delete-user",
  templateUrl: "./delete-user.component.html",
  styleUrls: ["./delete-user.component.css"],
})
export class DeleteUserComponent {
  @Input({ required: true }) public selectedUser: UserStructureProfile | null;
  @Output() deleteComplete = new EventEmitter<void>();

  public loading: boolean;
  public followedUsagers: Pick<Usager, "ref">[] = [];
  public referrers: Pick<UserStructure, "id">[] = [];
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
        this.manageUsersService
          .reassignReferrers(this.selectedUser, this.newReferrerId)
          .pipe(
            concatMap(() =>
              this.manageUsersService.deleteUser(this.selectedUser.uuid)
            )
          )
          .subscribe({
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
