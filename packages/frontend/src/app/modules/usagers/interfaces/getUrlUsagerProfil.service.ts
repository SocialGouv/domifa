import { ETAPES_DEMANDE_URL } from "../../../../_common/model/usager/ETAPES_DEMANDE_URL.const";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";

export const getUrlUsagerProfil = (usager: Partial<UsagerLight>): string => {
  if (usager && usager?.decision) {
    if (usager.decision.statut === "ATTENTE_DECISION") {
      // Retour à la page de décision
      return "/usager/" + usager.ref + "/edit/decision";
    } else if (usager.decision.statut === "INSTRUCTION") {
      // Instruction, on renvoi vers le dossier d'édition
      return usager.typeDom === "RENOUVELLEMENT"
        ? "/usager/" + usager.ref
        : // Retour à la dernière étape validée
          "/usager/" +
            usager.ref +
            "/edit/" +
            ETAPES_DEMANDE_URL[usager.etapeDemande];
    } else {
      // Retour vers le profil pour les refusés, radiés, valide
      return "/usager/" + usager.ref;
    }
  }
  return "/nouveau";
};
