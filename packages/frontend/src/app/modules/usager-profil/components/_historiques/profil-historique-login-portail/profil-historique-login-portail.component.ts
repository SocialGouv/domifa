import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  Order,
  PageOptions,
  PageResults,
  UserUsagerLogin,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { UserStructure } from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services";
import { fadeIn } from "../../../../../shared";

@Component({
  animations: [fadeIn],
  selector: "app-profil-historique-login-portail",
  templateUrl: "./profil-historique-login-portail.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueLoginPortailComponent
  implements OnInit, OnDestroy
{
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public interactions: UserUsagerLogin[];
  private subscription = new Subscription();

  public loading: boolean;

  public params: PageOptions = {
    order: Order.DESC,
    page: 1,
    take: 10,
  };

  public searchResults: PageResults<UserUsagerLogin> = {
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

  constructor(private readonly interactionService: InteractionService) {
    this.loading = true;
    this.interactions = [];
  }

  public ngOnInit(): void {
    this.getInteractions();
  }

  public getInteractions() {
    this.loading = true;
    this.subscription.add(
      this.interactionService
        .getLoginPortail(this.usager.ref, this.params)
        .subscribe((searchResults: PageResults<UserUsagerLogin>) => {
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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
