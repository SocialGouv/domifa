import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../shared/services";
import { ManageUsagersService } from "../../services/manage-usagers.service";

@Component({
  selector: "app-assign-referrers",
  templateUrl: "./assign-referrers.component.html",
  styleUrls: ["./assign-referrers.component.css"],
})
export class AssignReferrersComponent {
  private readonly subscription = new Subscription();
  @Input() public selectedRefs: Set<number>;
  @Input() public newReferrerId: number;
  @Output() public actionAfterSuccess = new EventEmitter<number | null>();

  public loading: boolean = false;
  public submitted = false;

  constructor(
    private readonly managerUsagersService: ManageUsagersService,
    private readonly toastService: CustomToastService
  ) {}

  public updateReferrers(event: number | null) {
    this.newReferrerId = event;
  }

  assignReferrers() {
    this.loading = true;
    this.subscription.add(
      this.managerUsagersService
        .assignReferrers(this.selectedRefs, this.newReferrerId)
        .subscribe({
          next: () => {
            this.actionAfterSuccess.emit();
            this.toastService.success("Référénts assignés avec succès");
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Impossible de réassigner les utilisateurs"
            );
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }
}
