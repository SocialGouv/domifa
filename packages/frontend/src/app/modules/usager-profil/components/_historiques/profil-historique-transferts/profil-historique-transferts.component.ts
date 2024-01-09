import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  UserStructure,
  HISTORY_ACTIONS,
} from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerOptionsService } from "../../../services/usager-options.service";
import { UsagersFilterCriteriaSortValues } from "../../../../manage-usagers/components/usager-filter";
import { UsagerOptionsHistory } from "@domifa/common";

@Component({
  selector: "app-profil-historique-transferts",
  templateUrl: "./profil-historique-transferts.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueTransfertsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  private subscription = new Subscription();

  public transfertHistory: UsagerOptionsHistory[];
  public readonly HISTORY_ACTIONS = HISTORY_ACTIONS;

  public sortValue: UsagersFilterCriteriaSortValues = "desc";
  public currentKey: keyof UsagerOptionsHistory = "createdAt";

  constructor(private readonly usagerOptionsService: UsagerOptionsService) {
    this.transfertHistory = [];
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.usagerOptionsService
        .findHistory(this.usager.ref, "transfert")
        .subscribe((optionsHistorique: UsagerOptionsHistory[]) => {
          this.transfertHistory = optionsHistorique;
        })
    );
  }
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
