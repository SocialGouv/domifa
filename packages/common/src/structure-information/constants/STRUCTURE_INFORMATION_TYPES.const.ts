import { StructureInformationType } from "../types";

export const STRUCTURE_INFORMATION_TYPES: {
  [key in StructureInformationType]: {
    label: string;
    color: string;
    bg: string;
  };
} = {
  closing: {
    label: "❌ Fermeture",
    color: "white",
    bg: "danger",
  },
  "opening-hours": {
    label: "⏰ Horaires d'ouverture",
    color: "dark",
    bg: "warning",
  },
  general: {
    label: "Information générale",
    color: "white",
    bg: "primary",
  },
  other: {
    label: "Autre information",
    color: "dark",
    bg: "secondary",
  },
};
