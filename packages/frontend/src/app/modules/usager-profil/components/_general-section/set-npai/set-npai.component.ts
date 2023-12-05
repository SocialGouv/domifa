import { Component, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../../shared/services";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../../services/usager-profil.service";

@Component({
  selector: "app-set-npai",
  templateUrl: "./set-npai.component.html",
})
export class SetNpaiComponent implements OnDestroy {
  @Input() public usager!: UsagerFormModel;
  public subscription = new Subscription();
  public loading = false;

  constructor(
    public usagerProfilService: UsagerProfilService,
    public toastService: CustomToastService
  ) {}

  public stopCourrier(): void {
    this.loading = true;
    this.subscription.add(
      this.usagerProfilService.stopCourrier(this.usager.ref).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.success("Action réalisée avec succès");
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'enregistrer cette action");
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
