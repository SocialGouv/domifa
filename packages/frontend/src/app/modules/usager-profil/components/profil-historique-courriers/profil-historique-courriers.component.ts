import { Component, Input, OnInit } from "@angular/core";

import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { AppUser, UsagerLight } from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";

import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";

import { Interaction } from "../../../usagers/interfaces/interaction";
import { InteractionService } from "../../../usager-shared/services/interaction.service";

@Component({
  selector: "app-profil-historique-courriers",
  templateUrl: "./profil-historique-courriers.component.html",
  styleUrls: ["./profil-historique-courriers.component.css"],
})
export class ProfilHistoriqueCourriersComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: AppUser;

  public typeInteraction: InteractionType;
  public interactions: Interaction[];

  constructor(
    private notifService: ToastrService,
    private matomo: MatomoTracker,
    private interactionService: InteractionService
  ) {}

  public ngOnInit(): void {
    this.getInteractions();
  }

  public deleteInteraction(interactionUuid: string) {
    this.matomo.trackEvent("profil", "interactions", "delete", 1);
    this.interactionService.delete(this.usager.ref, interactionUuid).subscribe({
      next: (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.notifService.success("Interactionn supprimée avec succès");
        this.getInteractions();
      },
      error: (error) => {
        this.notifService.error("Impossible de supprimer l'interaction");
      },
    });
  }

  private getInteractions() {
    this.interactionService
      .getInteractions({
        usagerRef: this.usager.ref,
      })
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }
}
