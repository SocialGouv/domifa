import { type StructureStatsSexe } from "./StructureStatsSexe.interface";
import { type StructureStatsTranchesAge } from "./StructureStatsTranchesAge.interface";

// stats sur les usagers valides à une date donnée
export interface StructureStatsQuestionsAtDateValidUsagers {
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
  typeDom: {
    premiere: number;
    renouvellement: number;
  };
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
    sortie_hospitalisation: number;
    sortie_incarceration: number;
    violence: number;
    non_renseigne: number;
  };
  liencommune: {
    residentiel: number;
    parental: number;
    familial: number;
    professionnel: number;
    social: number;
    autre: number;
    non_renseigne: number;
  };
  raison: {
    // Q21
    exercice_droits: number;
    prestations_sociales: number;
    exercice_activite_pro: number;
    lutte_violence: number;
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
  // Ajout 2024: Personnes bénéficiant d'un accompagnement
  accompagnement: {
    oui: number;
    non: number;
    non_renseigne: number;
  };
  // Ajout 2024: situation professionnelle des personnes
  situationPro: {
    non_renseigne: number;
    etudiant: number;
    salarie: number;
    independant: number;
    france_travail: number;
    rsa: number;
    aah: number;
    retraite: number;
    autre: number;
  };
}
