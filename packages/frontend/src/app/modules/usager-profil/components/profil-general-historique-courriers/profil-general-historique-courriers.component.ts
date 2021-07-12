import { Component, Input, OnInit } from "@angular/core";

import { AppUser } from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";
import { interactionsLabels } from "../../../../shared/constants/INTERACTIONS_LABELS.const";
import { InteractionService } from "../../../usager-shared/services/interaction.service";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { Interaction } from "../../../usagers/interfaces/interaction";

@Component({
  selector: "app-profil-general-historique-courriers",
  templateUrl: "./profil-general-historique-courriers.component.html",
  styleUrls: ["./profil-general-historique-courriers.component.css"],
})
export class ProfilGeneralHistoriqueCourriersComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: AppUser;

  public typeInteraction: InteractionType;
  public interactions: Interaction[];
  public interactionsLabels: {
    [key: string]: any;
  } = interactionsLabels;

  constructor(private interactionService: InteractionService) {}

  public ngOnInit(): void {
    this.getInteractions();
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
