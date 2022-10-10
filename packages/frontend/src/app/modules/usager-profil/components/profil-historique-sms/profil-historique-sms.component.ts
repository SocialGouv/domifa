import { AfterViewInit, Component, Input } from "@angular/core";
import { UserStructure } from "../../../../../_common/model";
import { MessageSms } from "../../../../../_common/model/message-sms";
import { SMS_LABELS } from "../../../../../_common/model/message-sms/MESSAGE_SMS_STATUS.const";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-historique-sms",
  templateUrl: "./profil-historique-sms.component.html",
  styleUrls: ["./profil-historique-sms.component.css"],
})
export class ProfilHistoriqueSmsComponent implements AfterViewInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public SMS_LABELS = SMS_LABELS;

  @Input() public messagesList: MessageSms[];

  constructor(private usagerProfilService: UsagerProfilService) {
    this.usager = new UsagerFormModel();
    this.messagesList = [];
  }

  public ngAfterViewInit(): void {
    this.getMySms();
  }

  public getMySms(): void {
    this.usagerProfilService.findMySms(this.usager.ref).subscribe({
      next: (messages: MessageSms[]) => (this.messagesList = messages),
    });
  }
}
