import { Component, Input } from "@angular/core";
import { UserStructure } from "@domifa/common";
import { ETAPES_DEMANDE_URL } from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-profil-alerts",
  templateUrl: "./profil-alerts.component.html",
  styleUrls: ["./profil-alerts.component.css"],
})
export class ProfilAlertsComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure | null;

  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;

  public getAlertClass(): string {
    if (!this.usager?.rdvInfo?.class) {
      return "fr-alert--info";
    }

    const alertClassMap: Record<string, string> = {
      danger: "fr-alert--error",
      warning: "fr-alert--warning",
      info: "fr-alert--info",
    };

    return alertClassMap[this.usager.rdvInfo.class] || "fr-alert--info";
  }
}
