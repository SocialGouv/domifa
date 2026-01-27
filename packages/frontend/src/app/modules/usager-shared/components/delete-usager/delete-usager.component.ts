import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, concatMap, from, toArray } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";
import { Store } from "@ngrx/store";
import { usagerActions, UsagerState } from "../../../../shared";
import { Router } from "@angular/router";
import { UserStructure } from "@domifa/common";
import { DeleteUsagerContext } from "../../interfaces";

@Component({
  selector: "app-delete-usager",
  templateUrl: "./delete-usager.component.html",
  styleUrls: ["./delete-usager.component.css"],
})
export class DeleteUsagerComponent implements OnDestroy {
  @Input() public selectedRefs: Set<number> = new Set();

  @Input({ required: true })
  public context!: DeleteUsagerContext;

  @Output() public actionAfterSuccess = new EventEmitter<void>();

  @Input() public me!: UserStructure;

  private readonly subscription = new Subscription();

  public loading = false;

  constructor(
    private readonly modalService: NgbModal,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly toastService: CustomToastService,
    private readonly store: Store<UsagerState>,
    private readonly router: Router
  ) {}

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
              this.selectedRefs.size > 1
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

            if (this.actionAfterSuccess) {
              this.actionAfterSuccess.emit();
            }
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
