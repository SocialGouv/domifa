import { StructureCustomDocType } from "..";

export const STRUCTURE_CUSTOM_DOC_LABELS: {
  [key in StructureCustomDocType]: string;
} = {
  attestation_postale: "Attestation postale",
  courrier_radiation: "Courrier de radiation",
  acces_espace_domicilie: "Accès à Mon DomiFa",
  autre: "Autre document",
};
