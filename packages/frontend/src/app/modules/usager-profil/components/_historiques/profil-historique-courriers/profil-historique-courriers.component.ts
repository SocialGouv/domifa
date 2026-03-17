import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../../shared/services";
import { fadeIn } from "../../../../../shared";
import {
  UserStructure,
  Interaction,
  PageOptions,
  PageResults,
} from "@domifa/common";

@Component({
  selector: "app-profil-historique-courriers",
  templateUrl: "./profil-historique-courriers.component.html",

  animations: [fadeIn],
})
export class ProfilHistoriqueCourriersComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public interactions: Interaction[];
  public interactionToDelete: Interaction | null;
  private readonly subscription = new Subscription();

  @ViewChild("deleteInteractionModal", { static: false })
  public deleteInteractionModal!: DsfrModalComponent;

  public loading = true;
  public params = new PageOptions({ take: 50 });

  public searchResults = new PageResults<Interaction>();

  constructor(
    private readonly toastService: CustomToastService,
    private readonly interactionService: InteractionService
  ) {
    this.interactionToDelete = null;
    this.interactions = [];
  }

  public get totalPages(): number {
    return Math.ceil(this.searchResults.meta.itemCount / this.params.take);
  }

  public onPageSelect(page: number): void {
    this.params.page = page;
    this.getInteractions();
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
    this.deleteInteractionModal.open();
  }

  public closeModals(): void {
    this.loading = false;
    this.interactionToDelete = null;
    this.deleteInteractionModal.close();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
