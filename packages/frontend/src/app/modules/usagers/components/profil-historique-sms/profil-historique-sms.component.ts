import { Component, Input, OnInit } from "@angular/core";
import { AppUser } from "../../../../../_common/model";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../_common/model/interaction/constants";

import { MessageSms } from "../../../../../_common/model/message-sms";
import { MESSAGE_SMS_STATUS_LABEL_COLOR } from "../../../../../_common/model/message-sms/MESSAGE_SMS_STATUS_LABEL_COLOR.const";
import { UsagerService } from "../../services/usager.service";
import { UsagerFormModel } from "../form/UsagerFormModel";

@Component({
  selector: "app-profil-historique-sms",
  templateUrl: "./profil-historique-sms.component.html",
  styleUrls: ["./profil-historique-sms.component.css"],
})
export class ProfilHistoriqueSmsComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: AppUser;

  public INTERACTIONS_LABELS_SINGULIER = INTERACTIONS_LABELS_SINGULIER;
  public MESSAGE_SMS_STATUS_LABEL_COLOR = MESSAGE_SMS_STATUS_LABEL_COLOR;

  public messagesList: MessageSms[];

  constructor(private usagerService: UsagerService) {
    this.usager = new UsagerFormModel();
  }

  public ngOnInit(): void {
    this.usagerService.findMySms(this.usager).subscribe({
      next: (messages: MessageSms[]) => (this.messagesList = messages),
    });
  }
}
