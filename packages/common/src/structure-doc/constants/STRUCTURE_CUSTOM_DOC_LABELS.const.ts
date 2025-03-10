import { StructureCustomDocType } from "..";

export const STRUCTURE_CUSTOM_DOC_LABELS: {
  [key in StructureCustomDocType]: string;
} = {
  attestation_postale: "Attestation postale",
  cerfa_attestation: "Cerfa d'attestation d'élection de domicile",
  courrier_radiation: "Courrier de radiation",
  acces_espace_domicilie: "Accès à Mon DomiFa",
  autre: "Autre document",
};
