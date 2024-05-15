import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { Interaction, Order, PageResults, UserStructure } from "@domifa/common";

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
        .getInteractions(this.usager.ref, {
          order: Order.DESC,
          page: 1,
          take: 5,
        })
        .subscribe((interactions: PageResults<Interaction>) => {
          this.interactions = interactions.data;
        })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
