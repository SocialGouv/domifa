import { UsagerDecision, UsagerEntretien } from "@domifa/common";

export const getDecisionForStats = (
  decision: UsagerDecision
): Partial<UsagerDecision> => {
  return {
    uuid: decision.uuid,
    dateDecision: decision.dateDecision,
    dateDebut: decision.dateDebut,
    dateFin: decision.dateFin,
    typeDom: decision.typeDom,
    statut: decision.statut,
    motif: decision.motif,
    orientation: decision.orientation,
  };
};

export const getEntretienForStats = (
  entretien: UsagerEntretien
): Partial<UsagerEntretien> => {
  return {
    usagerUUID: entretien.usagerUUID,
    domiciliation: entretien.domiciliation,
    typeMenage: entretien.typeMenage,
    revenus: entretien.revenus,
    orientation: entretien.orientation,
    liencommune: entretien.liencommune,
    residence: entretien.residence,
    cause: entretien.cause,
    raison: entretien.raison,
    accompagnement: entretien.accompagnement,
  };
};
