import { UserStructureResume } from "./../../_common/model/user-structure/UserStructureResume.type";
import { UsagerDecisionMotif } from "./../../_common/model/usager/UsagerDecisionMotif.type";
import {
  MOTIFS_RADIATION_LABELS,
  MOTIFS_REFUS_LABELS,
  UsagerDecision,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
} from "../../_common/model";
import { format } from "date-fns";

export const generateMotifLabel = (decision: UsagerDecision): string => {
  if (!decision) {
    return "";
  }

  let motif = "";
  if (decision.statut === "REFUS" || decision.statut === "RADIE") {
    if (decision.motif === "AUTRE") {
      motif =
        decision.motifDetails !== "" && decision.motifDetails !== null
          ? "Autre motif : " + decision.motifDetails
          : ("Autre motif non précisé" as any);
    } else {
      motif =
        decision.statut === "REFUS"
          ? MOTIFS_REFUS_LABELS[decision.motif as UsagerDecisionMotif]
          : (MOTIFS_RADIATION_LABELS[
              decision.motif as UsagerDecisionMotif
            ] as any);
    }
  }

  return motif;
};

export const generateNoteForDecision = (
  decision: UsagerDecision,
  createdBy: UserStructureResume
): string => {
  let strDecision = `Suppression de la décision : \n ${
    USAGER_DECISION_STATUT_LABELS_PROFIL[decision.statut]
  }`;
  const dateDebut = format(new Date(decision.dateDebut), "dd/MM/yyyy");
  const dateFin = format(new Date(decision.dateFin), "dd/MM/yyyy");

  if (decision.statut === "VALIDE") {
    strDecision = `${strDecision} du ${dateDebut} au ${dateFin}\n`;
  } else {
    strDecision = `${strDecision} le ${dateDebut}\n`;
  }
  return `${strDecision}Décision supprimée par ${createdBy.userName}`;
};
