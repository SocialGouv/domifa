import { Component, DestroyRef, inject, input } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CustomToastService } from "../../../../shared/services";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../../services/usager-profil.service";

@Component({
  selector: "app-set-npai",
  standalone: true,
  templateUrl: "./set-npai.component.html",
})
export class SetNpaiComponent {
  public usager = input.required<UsagerFormModel>();
  public loading = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly usagerProfilService = inject(UsagerProfilService);
  private readonly toastService = inject(CustomToastService);

  public stopCourrier(): void {
    this.loading = true;
    this.usagerProfilService
      .stopCourrier(this.usager().ref)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastService.success("Action réalisée avec succès");
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'enregistrer cette action");
        },
      });
  }
}
