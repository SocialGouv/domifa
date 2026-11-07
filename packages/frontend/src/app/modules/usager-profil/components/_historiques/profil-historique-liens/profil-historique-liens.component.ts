import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  LOG_ACTION_LABELS,
  PageOptions,
  PageResults,
  UserStructure,
} from "@domifa/common";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import {
  UsagerLienLogEntry,
  UsagerLienService,
} from "../../../../usager-shared/services/usager-lien.service";

@Component({
  selector: "app-profil-historique-liens",
  templateUrl: "./profil-historique-liens.component.html",
  standalone: false,
})
export class ProfilHistoriqueLiensComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure;

  public readonly LOG_ACTION_LABELS = LOG_ACTION_LABELS;

  public loading = true;
  public params = new PageOptions({ take: 25 });
  public searchResults = new PageResults<UsagerLienLogEntry>();

  private readonly subscription = new Subscription();

  constructor(private readonly usagerLienService: UsagerLienService) {}

  public get totalPages(): number {
    return Math.ceil(this.searchResults.meta.itemCount / this.params.take);
  }

  public ngOnInit(): void {
    this.getHistory();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onPageSelect(page: number): void {
    this.params.page = page;
    this.getHistory();
  }

  public getHistory(): void {
    this.loading = true;
    this.subscription.add(
      this.usagerLienService
        .getHistory(this.usager.ref, this.params)
        .subscribe((searchResults) => {
          this.loading = false;
          this.searchResults = searchResults;
        })
    );
  }
}
