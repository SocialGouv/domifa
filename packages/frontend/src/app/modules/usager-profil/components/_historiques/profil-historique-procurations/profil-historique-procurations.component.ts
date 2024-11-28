import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { HISTORY_ACTIONS, SortValues } from "../../../../../../_common/model";
import { Subscription } from "rxjs";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerOptionsService } from "../../../services/usager-options.service";
import { UserStructure, UsagerOptionsHistory } from "@domifa/common";

@Component({
  selector: "app-profil-historique-procurations",
  templateUrl: "./profil-historique-procurations.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueProcurationsComponent
  implements OnInit, OnDestroy
{
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure;
  private subscription = new Subscription();
  public procurationHistory: UsagerOptionsHistory[];
  public readonly HISTORY_ACTIONS = HISTORY_ACTIONS;

  constructor(private readonly usagerOptionsService: UsagerOptionsService) {
    this.procurationHistory = [];
  }

  public sortValue: SortValues = "desc";
  public currentKey: keyof UsagerOptionsHistory = "createdAt";

  public ngOnInit(): void {
    this.subscription.add(
      this.usagerOptionsService
        .findHistory(this.usager.ref, "procuration")
        .subscribe((optionsHistorique: UsagerOptionsHistory[]) => {
          this.procurationHistory = optionsHistorique;
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
