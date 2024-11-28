import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import {
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerDecision,
  UserStructure,
} from "@domifa/common";
import { SortValues } from "../../../../../../_common/model";

@Component({
  selector: "app-profil-historique-decisions",
  templateUrl: "./profil-historique-decisions.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueDecisionsComponent {
  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;
  @Input({ required: true }) public me!: UserStructure;
  @Input({ required: true }) public usager!: UsagerFormModel;

  public sortValue: SortValues = "desc";
  public currentKey: keyof UsagerDecision = "dateDecision";
}
