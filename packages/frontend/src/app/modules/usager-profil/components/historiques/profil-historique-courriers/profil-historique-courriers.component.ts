import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  DEFAULT_MODAL_OPTIONS,
  UserStructure,
} from "../../../../../../_common/model";
import {
  UsagerFormModel,
  Interaction,
} from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { Subscription } from "rxjs";
import { InteractionEvent } from "@domifa/common";

@Component({
  selector: "app-profil-historique-courriers",
  templateUrl: "./profil-historique-courriers.component.html",
})
export class ProfilHistoriqueCourriersComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public interactions: Interaction[];
  public interactionToDelete: Interaction | null;
  private subscription = new Subscription();

  @ViewChild("deleteInteractionModal", { static: true })
  public deleteInteractionModal!: TemplateRef<NgbModalRef>;

  @ViewChild("restoreInteractionModal", { static: true })
  public restoreInteractionModal!: TemplateRef<NgbModalRef>;

  public loading: boolean;

  constructor(
    private readonly toastService: CustomToastService,
    private readonly interactionService: InteractionService,
    private readonly modalService: NgbModal
  ) {
    this.loading = false;
    this.interactionToDelete = null;
    this.interactions = [];
  }

  public ngOnInit(): void {
    this.getInteractions();
  }

  public deleteInteraction() {
    if (this.interactionToDelete) {
      this.loading = true;
      this.subscription.add(
        this.interactionService
          .delete(this.usager.ref, this.interactionToDelete.uuid)
          .subscribe({
            next: () => {
              const message =
                this.interactionToDelete?.event === "create"
                  ? "supprimée"
                  : "restaurée";

              this.toastService.success(`Interaction ${message} avec succès`);
              this.interactionToDelete = null;
              this.getInteractions();
              this.closeModals();
            },
            error: () => {
              this.toastService.error("Impossible de supprimer l'interaction");
            },
          })
      );
    }
  }

  private getInteractions() {
    this.subscription.add(
      this.interactionService
        .getInteractions({
          usagerRef: this.usager.ref,
        })
        .subscribe((interactions: Interaction[]) => {
          this.interactions = interactions;
        })
    );
  }

  public openDeleteInteractionModal(restoreOrDelete: InteractionEvent): void {
    this.modalService.open(
      restoreOrDelete === "delete"
        ? this.deleteInteractionModal
        : this.restoreInteractionModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public closeModals(): void {
    this.loading = false;
    this.interactionToDelete = null;
    this.modalService.dismissAll();
  }

  public goToPrint(): void {
    window.print();
  }
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
