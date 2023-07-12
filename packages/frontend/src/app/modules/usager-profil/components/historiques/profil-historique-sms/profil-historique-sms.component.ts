import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  UserStructure,
  SMS_LABELS,
  MessageSms,
} from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../../services/usager-profil.service";

@Component({
  selector: "app-profil-historique-sms",
  templateUrl: "./profil-historique-sms.component.html",
  styleUrls: ["./profil-historique-sms.component.css"],
})
export class ProfilHistoriqueSmsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  private subscription = new Subscription();

  public readonly SMS_LABELS = SMS_LABELS;
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
