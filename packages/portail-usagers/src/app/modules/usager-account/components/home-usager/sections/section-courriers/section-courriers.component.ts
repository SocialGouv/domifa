import { Component, Input, OnInit } from "@angular/core";

import { DEFAULT_USAGER_PROFILE } from "../../../../../../../_common/mocks/DEFAULT_USAGER.const";
import { Interaction, PortailUsagerPublic } from "@domifa/common";
import { map, Subscription } from "rxjs";
import { InteractionService } from "../../../../services/interaction.service";
import { CustomToastService } from "../../../../../shared/services/custom-toast.service";
import {
  PendingInteractionsCount,
  TypeGroupedInteractions,
} from "../../../../types/usager-interactions";

@Component({
  selector: "app-section-courriers",
  templateUrl: "./section-courriers.component.html",
  styles: [
    ".fr-border-left-blue-france { border-left: 3px solid var(--blue-france-sun-113-625) !important; }",
  ],
})
export class SectionCourriersComponent implements OnInit {
  @Input() public usager!: PortailUsagerPublic;
  public groupedPendingInteractions?: TypeGroupedInteractions;
  public pendingInteractions: PendingInteractionsCount = {
    courrierIn: 0,
    colisIn: 0,
    recommandeIn: 0,
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
      this.interactionService
        .getPendingInteractions()
        .pipe(
          map((interaction) =>
            interaction.map((i) => ({
              ...i,
              dateInteraction: new Date(i.dateInteraction),
            })),
          ),
        )
        .subscribe({
          next: (interactions: Interaction[]) => {
            interactions.forEach((interaction) => {
              this.pendingInteractions[interaction.type] =
                (this.pendingInteractions[interaction.type] ?? 0) + 1;
            });
            this.groupedPendingInteractions =
              this.agregateItemsByDate(interactions);
          },
          error: () => {
            this.toastr.error(
              "Le chargement de votre historique a échoué. Veuillez réessayer plus tard",
            );
          },
        }),
    );
  }

  public agregateItemsByDate(
    interactions: Interaction[],
  ): TypeGroupedInteractions {
    return interactions.reduce<TypeGroupedInteractions>((acc, it) => {
      const type = it.type;

      if (!acc[type]) {
        acc[type] = {};
      }

      const dateKey = it.dateInteraction.toISOString().split("T")[0];

      if (!acc[type]![dateKey]) {
        acc[type]![dateKey] = {
          numberOfItems: 0,
          comments: [],
        };
      }
      acc[type]![dateKey].numberOfItems++;

      if (it.content) {
        acc[type]![dateKey].comments.push(it.content);
      }

      return acc;
    }, {});
  }
}
