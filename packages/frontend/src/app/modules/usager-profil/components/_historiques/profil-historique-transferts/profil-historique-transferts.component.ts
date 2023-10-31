import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  UserStructure,
  UsagerOptionsHistory,
  HISTORY_ACTIONS,
} from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerOptionsService } from "../../../services/usager-options.service";

@Component({
  selector: "app-profil-historique-transferts",
  templateUrl: "./profil-historique-transferts.component.html",
})
export class ProfilHistoriqueTransfertsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  private subscription = new Subscription();

  public transfertHistory: UsagerOptionsHistory[];
  public readonly HISTORY_ACTIONS = HISTORY_ACTIONS;

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
