import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
} from "@domifa/common";
import { v4 as uuidv4 } from "uuid";
import { getStringOrNull } from "../../util/functions";

export const getDecisionForStats = (
  decision: UsagerDecision
): Partial<UsagerDecision> => {
  return {
    uuid: decision?.uuid ?? uuidv4(),
    dateDecision: decision.dateDecision,
    dateDebut: decision.dateDebut,
    dateFin: decision.dateFin,
    typeDom: decision.typeDom,
    statut: decision.statut,
    motif: decision?.motif ?? null,
    orientation: decision?.orientation ?? null,
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
    domiciliation: getStringOrNull(entretien?.domiciliation),
    typeMenage: getStringOrNull(entretien?.typeMenage),
    revenus: getStringOrNull(entretien?.revenus),
    orientation: getStringOrNull(entretien?.orientation),
    liencommune: getStringOrNull(entretien?.liencommune),
    residence: getStringOrNull(entretien?.residence),
    cause: getStringOrNull(entretien?.cause),
    raison: getStringOrNull(entretien?.raison),
    accompagnement: getStringOrNull(entretien?.accompagnement),
    situationPro: getStringOrNull(entretien?.situationPro),
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
