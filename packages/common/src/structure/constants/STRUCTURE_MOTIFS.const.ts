import { StructureRefusMotif, StructureSuppressionMotif } from "../enums";

// Labels pour les motifs de refus
export const MOTIFS_REFUS_STRUCTURE_LABELS: {
  [key in StructureRefusMotif]: string;
} = {
  COMPTE_EXISTANT: "La structure dispose déjà d'un compte sur la plateforme",
  PAS_DE_DOMICILIATION:
    "La structure ne propose pas/plus de service de domiciliation",
  ERREUR_DOMICILIE:
    "La création du compte structure a été créée par erreur par un domicilié",
};

// Labels pour les motifs de suppression
export const MOTIFS_SUPPRESSION_STRUCTURE_LABELS: {
  [key in StructureSuppressionMotif]: string;
} = {
  COMPTE_EXISTANT: "La structure dispose déjà d'un compte sur la plateforme",
  PAS_DE_DOMICILIATION:
    "La structure ne propose pas/plus de service de domiciliation",
  PLUS_UTILISATION: "La structure ne souhaite pas/plus utiliser la plateforme",
  INACTIF: "Le compte structure est inactif depuis une période prolongée",
};
