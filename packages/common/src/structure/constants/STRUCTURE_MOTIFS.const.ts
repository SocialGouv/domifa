import {
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "../enums";

export const MOTIFS_REFUS_STRUCTURE_LABELS: {
  [key in StructureDecisionRefusMotif]: string;
} = {
  COMPTE_EXISTANT: "La structure dispose déjà d'un compte sur la plateforme",
  PAS_DE_DOMICILIATION:
    "La structure ne propose pas/plus de service de domiciliation",
  ERREUR_DOMICILIE:
    "La création du compte structure a été créée par erreur par un domicilié",
};

export const MOTIFS_SUPPRESSION_STRUCTURE_LABELS: {
  [key in StructureDecisionSuppressionMotif]: string;
} = {
  COMPTE_EXISTANT: "La structure dispose déjà d'un compte sur la plateforme",
  PAS_DE_DOMICILIATION:
    "La structure ne propose pas/plus de service de domiciliation",
  PLUS_UTILISATION: "La structure ne souhaite pas/plus utiliser la plateforme",
  INACTIF: "Le compte structure est inactif depuis une période prolongée",
};
