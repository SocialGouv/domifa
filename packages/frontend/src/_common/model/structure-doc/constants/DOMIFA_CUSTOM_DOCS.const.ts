import { StructureDoc } from "../types";

export const DOMIFA_CUSTOM_DOCS: StructureDoc[] = [
  {
    uuid: "xx",
    id: 10,
    label: "Attestation postale",
    createdBy: {
      id: 0,
      nom: "Domifa",
      prenom: "Domifa",
    },

    custom: true,
    filetype: "application/msword",
    structureId: 0,
  },
  {
    id: 100,
    uuid: "xx",
    label: "Courrier de radiation",
    createdBy: {
      id: 0,
      nom: "Domifa",
      prenom: "Domifa",
    },

    custom: true,
    filetype: "application/msword",
    structureId: 0,
  },
];
