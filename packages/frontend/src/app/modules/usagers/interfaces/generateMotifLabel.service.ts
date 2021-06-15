import { UsagerLight } from "../../../../_common/model";
import {
  MOTIFS_REFUS_LABELS,
  MOTIFS_RADIATION_LABELS,
} from "../../../../_common/model/usager/labels";

export const generateMotifLabel = (usager: UsagerLight): string => {
  let motif = "" as any;
  if (
    usager.decision.statut === "REFUS" ||
    usager.decision.statut === "RADIE"
  ) {
    if (usager.decision.motif === "AUTRE") {
      motif =
        usager.decision.motifDetails !== ""
          ? "Autre motif" + usager.decision.motifDetails
          : ("Autre motif non précisé" as any);
    } else {
      motif =
        usager.decision.statut === "REFUS"
          ? MOTIFS_REFUS_LABELS[usager.decision.motif]
          : (MOTIFS_RADIATION_LABELS[usager.decision.motif] as any);
    }
  }

  return motif;
};
