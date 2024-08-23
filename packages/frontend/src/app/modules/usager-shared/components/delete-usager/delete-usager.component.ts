import { Component, Input, OnDestroy } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, concatMap, from, toArray } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";
import { Store } from "@ngrx/store";
import { usagerActions } from "../../../../shared";
import { Router } from "@angular/router";
import { UserStructure } from "@domifa/common";

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
    private readonly store: Store,
    private readonly router: Router
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
                : "Domicilié supprimé avec succès";
            this.toastService.success(message);
            this.loading = false;

            if (this.context === "PROFIL") {
              this.router.navigate(["/manage"]);
            }
            this.modalService.dismissAll();
            this.store.dispatch(
              usagerActions.deleteUsagers({ usagerRefs: this.selectedRefs })
            );
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
