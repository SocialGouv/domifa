import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";

import {
  DEFAULT_MODAL_OPTIONS,
  Order,
  PageOptions,
  PageResults,
  UserStructure,
} from "../../../../../../_common/model";
import {
  UsagerFormModel,
  Interaction,
} from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../../shared/services";
import { fadeIn } from "../../../../../shared";

@Component({
  selector: "app-profil-historique-courriers",
  templateUrl: "./profil-historique-courriers.component.html",
  styleUrls: ["../historique-table.scss"],
  animations: [fadeIn],
})
export class ProfilHistoriqueCourriersComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public interactions: Interaction[];
  public interactionToDelete: Interaction | null;
  private subscription = new Subscription();

  @ViewChild("deleteInteractionModal", { static: true })
  public deleteInteractionModal!: TemplateRef<NgbModalRef>;

  public loading: boolean;

  public params: PageOptions = {
    order: Order.DESC,
    page: 1,
    take: 10,
  };

  public searchResults: PageResults<Interaction> = {
    data: [],
    meta: {
      page: 0,
      take: 0,
      itemCount: 0,
      pageCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  constructor(
    private readonly toastService: CustomToastService,
    private readonly interactionService: InteractionService,
    private readonly modalService: NgbModal
  ) {
    this.loading = true;
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
              this.toastService.success(`Interaction supprimée avec succès`);
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

  public getInteractions() {
    this.loading = true;
    this.subscription.add(
      this.interactionService
        .getInteractions(this.usager.ref, this.params)
        .subscribe((searchResults: PageResults<Interaction>) => {
          this.loading = false;
          this.interactions = searchResults.data;
          this.searchResults = searchResults;
          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        })
    );
  }

  public openDeleteInteractionModal(interaction: Interaction): void {
    this.interactionToDelete = interaction;
    this.modalService.open(this.deleteInteractionModal, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals(): void {
    this.loading = false;
    this.interactionToDelete = null;
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
