import { Component, Input, OnInit } from "@angular/core";

import { DEFAULT_USAGER_PROFILE } from "../../../../../../../_common/mocks/DEFAULT_USAGER.const";
import {
  Interaction,
  InteractionType,
  PortailUsagerPublic,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { InteractionService } from "../../../../services/interaction.service";
import { CustomToastService } from "../../../../../shared/services/custom-toast.service";

@Component({
  selector: "app-section-courriers",
  templateUrl: "./section-courriers.component.html",
})
export class SectionCourriersComponent implements OnInit {
  @Input() public usager!: PortailUsagerPublic;

  public pendingInteractions: {
    [key in InteractionType]?: Interaction[];
  } = {
    courrierIn: [],
    colisIn: [],
    recommandeIn: [],
  };
  private subscription = new Subscription();

  constructor(
    private readonly interactionService: InteractionService,
    private readonly toastr: CustomToastService,
  ) {
    this.usager = DEFAULT_USAGER_PROFILE.usager;
  }

  ngOnInit() {
    this.subscription.add(
      this.interactionService.getPendingInteractions().subscribe({
        next: (results: Interaction[]) => {
          this.sortInteractions(results);
        },
        error: () => {
          this.toastr.error(
            "Le chargement de votre historique a échoué. Veuillez réessayer plus tard",
          );
        },
      }),
    );
  }

  private sortInteractions(interactions: Interaction[]) {
    interactions.forEach((interaction: Interaction) => {
      this.pendingInteractions[interaction.type]?.push(interaction);
    });
  }
}
