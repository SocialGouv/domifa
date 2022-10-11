import { Component, Input, OnInit } from "@angular/core";
import { UserStructure } from "../../../../../_common/model";

import {
  UsagerFormModel,
  Interaction,
} from "../../../usager-shared/interfaces";

import { InteractionService } from "../../../usager-shared/services/interaction.service";

@Component({
  selector: "app-profil-general-historique-courriers",
  templateUrl: "./profil-general-historique-courriers.component.html",
  styleUrls: ["./profil-general-historique-courriers.component.css"],
})
export class ProfilGeneralHistoriqueCourriersComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public interactions: Interaction[];

  constructor(private readonly interactionService: InteractionService) {
    this.interactions = [];
  }

  public ngOnInit(): void {
    this.getInteractions();
  }

  public getInteractions(): void {
    this.interactionService
      .getInteractions({
        usagerRef: this.usager.ref,
        maxResults: 5,
      })
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions.reduce(
          (filtered: Interaction[], interaction: Interaction) => {
            if (interaction.event !== "delete") {
              filtered.push(interaction);
            }
            return filtered;
          },
          []
        );
      });
  }
}
