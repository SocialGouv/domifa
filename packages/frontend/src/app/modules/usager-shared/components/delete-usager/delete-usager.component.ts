import { Component, Input, OnDestroy } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, concatMap, from, toArray } from "rxjs";
import { UserStructure } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";
import { Store } from "@ngrx/store";
import { cacheManager } from "../../../../shared";

@Component({
  selector: "app-delete-usager",
  templateUrl: "./delete-usager.component.html",
  styleUrls: ["./delete-usager.component.css"],
})
export class DeleteUsagerComponent implements OnDestroy {
  @Input() public selectedRefs: number[];
  @Input() public context!: "MANAGE" | "PROFIL";
  @Input() public me!: UserStructure;

  private subscription = new Subscription();

  public loading: boolean;

  constructor(
    private readonly modalService: NgbModal,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly toastService: CustomToastService,
    private readonly store: Store
  ) {
    this.loading = false;
    this.selectedRefs = [];
  }

  public deleteUsager(): void {
    this.loading = true;

    this.subscription.add(
      from(this.selectedRefs)
        .pipe(
          concatMap((ref: number) => this.usagerProfilService.delete(ref)),
          toArray()
        )
        .subscribe({
          next: () => {
            const message =
              this.selectedRefs.length > 1
                ? "Les dossiers sélectionnés ont été supprimé avec succès"
                : "Usager supprimé avec succès";
            this.toastService.success(message);
            this.loading = false;
            this.store.dispatch(
              cacheManager.deleteUsagers({ usagerRefs: this.selectedRefs })
            );
            this.modalService.dismissAll();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible de supprimer la fiche");
            window.location.reload();
          },
        })
    );
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
