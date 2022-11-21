import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
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
export class ProfilGeneralHistoriqueCourriersComponent
  implements OnInit, OnDestroy
{
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  private subscription = new Subscription();
  public interactions: Interaction[];

  constructor(private readonly interactionService: InteractionService) {
    this.interactions = [];
  }

  public ngOnInit(): void {
    this.getInteractions();
  }

  public getInteractions(): void {
    this.subscription.add(
      this.interactionService
        .getInteractions({
          usagerRef: this.usager.ref,
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
        })
    );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}