import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { USAGER_DECISION_STATUT_LABELS_PROFIL } from "@domifa/common";
import { UserStructure } from "../../../../../../_common/model";

@Component({
  selector: "app-profil-historique-decisions",
  templateUrl: "./profil-historique-decisions.component.html",
})
export class ProfilHistoriqueDecisionsComponent {
  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;
  @Input() public me!: UserStructure;
  @Input() public usager!: UsagerFormModel;
}
