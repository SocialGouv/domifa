import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
} from "@domifa/common";
import { v4 as uuidv4 } from "uuid";

const getValue = (value: any): any => {
  return typeof value === "undefined" || value === null ? null : value;
};

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
    domiciliation: getValue(entretien?.domiciliation),
    typeMenage: getValue(entretien?.typeMenage),
    revenus: getValue(entretien?.revenus),
    orientation: getValue(entretien?.orientation),
    liencommune: getValue(entretien?.liencommune),
    residence: getValue(entretien?.residence),
    cause: getValue(entretien?.cause),
    raison: getValue(entretien?.raison),
    accompagnement: getValue(entretien?.accompagnement),
    situationPro: getValue(entretien?.situationPro),
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
