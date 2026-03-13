import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../shared/services";
import { ManageUsagersService } from "../../services/manage-usagers.service";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-assign-referrers",
  templateUrl: "./assign-referrers.component.html",
  styleUrls: ["./assign-referrers.component.css"],
})
export class AssignReferrersComponent {
  private readonly subscription = new Subscription();
  @Input() public selectedRefs: Set<number>;
  @Input() public newReferrerId: number;
  @Input() public template: "modal" | "input" = "input";
  @Input() public me: UserStructure | null;

  @Output() public actionAfterSuccess = new EventEmitter<number | null>();

  @ViewChild("assignReferrersModal", { static: false })
  public assignReferrersModal!: DsfrModalComponent;

  public loading = false;
  public submitted = false;

  constructor(
    private readonly managerUsagersService: ManageUsagersService,
    private readonly toastService: CustomToastService
  ) {}

  public updateReferrers(event: number | null) {
    this.newReferrerId = event;
  }

  public openModal(): void {
    this.assignReferrersModal.open();
  }

  public closeModal(): void {
    this.assignReferrersModal.close();
  }

  public assignReferrers() {
    this.loading = true;
    this.subscription.add(
      this.managerUsagersService
        .assignReferrers(this.selectedRefs, this.newReferrerId)
        .subscribe({
          next: () => {
            this.actionAfterSuccess.emit();
            this.toastService.success("Référénts assignés avec succès");
            if (this.template === "modal") {
              this.closeModal();
            }
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
