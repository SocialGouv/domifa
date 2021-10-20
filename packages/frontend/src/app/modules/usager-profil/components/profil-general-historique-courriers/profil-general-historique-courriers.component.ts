import { Component, Input, OnInit } from "@angular/core";
import { UserStructure } from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";
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
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  public typeInteraction: InteractionType;
  public interactions: Interaction[];

  constructor(private interactionService: InteractionService) {}

  public ngOnInit(): void {
    this.getInteractions();
  }

  public getInteractions(): void {
    this.interactionService
      .getInteractions({
        usagerRef: this.usager.ref,
      })
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions.reduce((filtered, interaction) => {
          if (interaction.event !== "delete") {
            filtered.push(interaction);
          }
          return filtered;
        }, []);
      });
  }
}
