import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { MessageSms, SMS_STATUS_LABELS, UserStructure } from "@domifa/common";
import { SMS_LABELS } from "../../../constants";

@Component({
  selector: "app-profil-historique-sms",
  styleUrls: ["../historique-table.scss"],
  templateUrl: "./profil-historique-sms.component.html",
})
export class ProfilHistoriqueSmsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  private readonly subscription = new Subscription();

  public readonly SMS_LABELS = SMS_LABELS;
  public readonly SMS_STATUS_LABELS = SMS_STATUS_LABELS;
  public messagesList: MessageSms[];

  constructor(private readonly usagerProfilService: UsagerProfilService) {
    this.messagesList = [];
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.usagerProfilService.findMySms(this.usager.ref).subscribe({
        next: (messages: MessageSms[]) => (this.messagesList = messages),
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
