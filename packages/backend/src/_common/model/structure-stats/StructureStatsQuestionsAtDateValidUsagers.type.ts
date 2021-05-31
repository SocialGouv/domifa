import { StructureStatsSexe } from "./StructureStatsSexe.type";
import { StructureStatsTranchesAge } from "./StructureStatsTranchesAge.type";

// stats sur les usagers valides à une date donnée
export type StructureStatsQuestionsAtDateValidUsagers = {
  total: {
    // Q11
    usagers: number;
    ayantsDroits: number;
    usagerEtAyantsDroits: number;
  };
  age: {
    usagers: StructureStatsTranchesAge;
    ayantsDroits: Pick<StructureStatsTranchesAge, "mineurs" | "majeurs">;
  };
  sexe: StructureStatsSexe;
  menage: {
    // Q19
    couple_avec_enfant: number;
    couple_sans_enfant: number;
    femme_isole_avec_enfant: number;
    femme_isole_sans_enfant: number;
    homme_isole_avec_enfant: number;
    homme_isole_sans_enfant: number;
    non_renseigne: number;
  };
  cause: {
    // Q21
    autre: number;
    errance: number;
    expulsion: number;
    heberge_sans_adresse: number;
    itinerant: number;
    rupture: number;
    sortie_structure: number;
    violence: number;
    non_renseigne: number;
  };
  raison: {
    // Q21
    exercice_droits: number;
    prestations_sociales: number;
    autre: number;
    non_renseigne: number;
  };
  residence: {
    // Q_22
    domicile_mobile: number;
    hebergement_social: number;
    hebergement_tiers: number;
    hotel: number;
    sans_abri: number;
    autre: number;
    non_renseigne: number;
  };
};
