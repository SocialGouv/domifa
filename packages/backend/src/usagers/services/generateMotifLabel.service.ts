import { UsagerLight } from "./../../_common/model/usager/UsagerLight.type";
import {
  MOTIFS_REFUS_LABELS,
  MOTIFS_RADIATION_LABELS,
} from "../../_common/labels";

export const generateMotifLabel = (usager: UsagerLight): string => {
  if (
    usager.decision.statut === "REFUS" ||
    usager.decision.statut === "RADIE"
  ) {
    if (usager.decision.motif === "AUTRE") {
      usager.decision.motif =
        usager.decision.motifDetails !== ""
          ? "Autre motif" + usager.decision.motifDetails
          : ("Autre motif non précisé" as any);
    } else {
      usager.decision.motif =
        usager.decision.statut === "REFUS"
          ? MOTIFS_REFUS_LABELS[usager.decision.motif]
          : (MOTIFS_RADIATION_LABELS[usager.decision.motif] as any);
    }
  } else {
    usager.decision.motif = "" as any;
  }

  return usager.decision.motif;
};
