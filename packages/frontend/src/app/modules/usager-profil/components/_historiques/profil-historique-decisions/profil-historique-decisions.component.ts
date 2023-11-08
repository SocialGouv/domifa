import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import {
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerDecision,
} from "@domifa/common";
import { UserStructure } from "../../../../../../_common/model";
import { UsagersFilterCriteriaSortValues } from "../../../../manage-usagers/components/usager-filter";

@Component({
  selector: "app-profil-historique-decisions",
  templateUrl: "./profil-historique-decisions.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueDecisionsComponent {
  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;
  @Input() public me!: UserStructure;
  @Input() public usager!: UsagerFormModel;

  public sortValue: UsagersFilterCriteriaSortValues = "desc";
  public currentKey: keyof UsagerDecision = "dateDecision";
}
