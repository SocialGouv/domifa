import { UsagerDecision } from "./../../../../_common/model/usager/UsagerDecision.type";
import {
  motifsRadiation,
  motifsRefus,
} from "src/app/modules/usagers/usagers.labels";
import { UsagerDecisionStatut, UsagerTypeDom } from "../../../../_common/model";
import { UsagerDecisionMotif } from "../../../../_common/model/usager/UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "../../../../_common/model/usager/UsagerDecisionOrientation.type";

export class Decision implements UsagerDecision {
  public dateDebut: Date;
  public dateFin?: Date;
  public dateDecision: Date; // Now()

  public typeDom: UsagerTypeDom;
  public statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  public motif?: UsagerDecisionMotif;
  public motifDetails?: string;

  // Motif + détail
  public motifString?: string;

  // Orientation si refus
  public orientation?: UsagerDecisionOrientation;
  public orientationDetails?: string;

  public userId: number; // AppUser.id
  public userName: string; // AppUser.nom / prenom

  constructor(decision?: any) {
    this.dateDebut = (decision && new Date(decision.dateDebut)) || undefined;
    this.dateFin = (decision && new Date(decision.dateFin)) || undefined;
    this.dateDecision =
      (decision && new Date(decision.dateDecision)) || new Date();
    this.statut = (decision && decision.statut) || "INSTRUCTION";

    this.userName = (decision && decision.userName) || "";
    this.userId = (decision && decision.userId) || "";
    this.motifDetails = (decision && decision.motifDetails) || "";
    this.motif = (decision && decision.motif) || "";
    this.motifString = "";

    this.orientation = (decision && decision.orientation) || "";
    this.orientationDetails = (decision && decision.orientationDetails) || "";

    if (this.statut === "REFUS" || this.statut === "RADIE") {
      if (decision.motif === "AUTRE") {
        this.motifString =
          this.motifDetails !== ""
            ? this.motifDetails
            : "Autre motif non précisé";
      } else {
        this.motifString =
          this.statut === "REFUS"
            ? motifsRefus[decision.motif]
            : motifsRadiation[decision.motif];
      }
    }
  }
}
