import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
} from "@domifa/common";

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
): Pick<
  UsagerEntretien,
  | "domiciliation"
  | "typeMenage"
  | "revenus"
  | "orientation"
  | "liencommune"
  | "residence"
  | "cause"
  | "raison"
  | "accompagnement"
  | "situationPro"
> => {
  return {
    domiciliation: entretien?.domiciliation ?? null,
    typeMenage: entretien?.typeMenage ?? null,
    revenus: entretien?.revenus ?? null,
    orientation: entretien?.orientation ?? null,
    liencommune: entretien?.liencommune ?? null,
    residence: entretien?.residence ?? null,
    cause: entretien?.cause ?? null,
    raison: entretien?.raison ?? null,
    accompagnement: entretien?.accompagnement ?? null,
    situationPro: entretien?.situationPro ?? null,
  };
};

export const getAyantsDroitForStats = (
  ayantsDroit?: UsagerAyantDroit[]
): Partial<UsagerAyantDroit>[] => {
  return (ayantsDroit ?? []).map((x) => ({
    lien: x.lien,
    dateNaissance: x.dateNaissance,
  }));
};
