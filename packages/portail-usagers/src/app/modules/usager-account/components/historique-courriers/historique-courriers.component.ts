import { Component, OnDestroy, OnInit } from "@angular/core";
import { Order, PageResults, Interaction, PageOptions } from "@domifa/common";
import { InteractionService } from "../../services/interaction.service";
import { Subscription } from "rxjs";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { SeoService } from "../../../shared/services/seo.service";

@Component({
  selector: "app-historique-courriers",
  templateUrl: "./historique-courriers.component.html",
})
export class HistoriqueCourriersComponent implements OnDestroy, OnInit {
  private subscription = new Subscription();
  public interactions: Interaction[] = [];
  public loading = false;

  public params: PageOptions = {
    order: Order.DESC,
    page: 1,
    take: 5,
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
    private readonly usagerAuthService: UsagerAuthService,
    private readonly interactionService: InteractionService,
    private readonly toastr: CustomToastService,
    private readonly seoService: SeoService,
  ) {}

  ngOnInit() {
    this.seoService.updateTitleAndTags(
      "Historique des courriers - Mon DomiFa",
      "Consultez l'historique complet de vos interactions et courriers reçus",
    );
    this.loadInteractions();
  }

  public getInteractionsByPage(page: number): void {
    this.params.page = page;
    this.loadInteractions();
  }

  public getPreviousPage(): void {
    if (this.params.page === 1) {
      return;
    }
    this.params.page -= 1;
    this.loadInteractions();
  }

  private loadInteractions(): void {
    this.loading = true;
    if (this.usagerAuthService.currentUserValue?.usager?.ref) {
      this.subscription.add(
        this.interactionService.getInteractions(this.params).subscribe({
          next: (results: PageResults<Interaction>) => {
            this.searchResults = results;
            this.interactions = results.data;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.toastr.error(
              "Le chargement de votre historique a échoué. Veuillez réessayer plus tard",
            );
          },
        }),
      );
    }
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
