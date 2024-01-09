import { type StructureOrganismeType } from "../interfaces";

export const STRUCTURE_ORGANISME_TYPE_LABELS: {
  [key in StructureOrganismeType]: string;
} = {
  ASSOCIATION: "Association",
  MEDICO_SOCIAL: "Etablissement médico - social",
  HOPITAL: "Etablissement hospitalier",
  AUTRE: "Autre",
};
