import { ETAPES_DEMANDE_URL } from "../../../../_common/model/usager/_constants";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";

export const getUrlUsagerProfil = (usager: UsagerLight): string => {
  if (usager && usager?.decision) {
    if (usager.decision.statut === "ATTENTE_DECISION") {
      // Retour à la page de décision
      return "/usager/" + usager.ref + "/edit/decision";
    } else if (usager.decision.statut === "INSTRUCTION") {
      // Instruction, on renvoi vers le dossier d'édition
      return usager.typeDom === "RENOUVELLEMENT"
        ? "/profil/general/" + usager.ref
        : // Retour à la dernière étape validée
          "/usager/" +
            usager.ref +
            "/edit/" +
            ETAPES_DEMANDE_URL[usager.etapeDemande];
    } else {
      // Retour vers le profil pour les refusés, radiés, valide
      return "/profil/general/" + usager.ref;
    }
  }
  return "/nouveau";
};
