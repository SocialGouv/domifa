import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { UserStructure } from "../../../../../_common/model";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../_common/model/interaction/constants";
import { MessageSms } from "../../../../../_common/model/message-sms";
import { MESSAGE_SMS_STATUS } from "../../../../../_common/model/message-sms/MESSAGE_SMS_STATUS.const";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-historique-sms",
  templateUrl: "./profil-historique-sms.component.html",
  styleUrls: ["./profil-historique-sms.component.css"],
})
export class ProfilHistoriqueSmsComponent implements OnInit, AfterViewInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  public INTERACTIONS_LABELS_SINGULIER = INTERACTIONS_LABELS_SINGULIER;
  public MESSAGE_SMS_STATUS = MESSAGE_SMS_STATUS;

  @Input() public messagesList: MessageSms[];

  constructor(private usagerService: UsagerService) {
    this.usager = new UsagerFormModel();
    this.messagesList = [];
  }

  public ngOnInit(): void {
    // this.getMySms();
  }

  public ngAfterViewInit(): void {
    this.getMySms();
  }

  public getMySms() {
    this.usagerService.findMySms(this.usager).subscribe({
      next: (messages: MessageSms[]) => (this.messagesList = messages),
    });
  }
}
