import { StructureInformationType } from "../types";

export const STRUCTURE_INFORMATION_TYPES: {
  [key in StructureInformationType]: {
    label: string;
    variantClass: string;
    iconClass: string;
    // Params below to be removed once Domifa is migrated to DSFR
    color: string;
    bg: string;
  };
} = {
  closing: {
    label: "❌ Fermeture",
    variantClass: "fr-callout--pink-tuile",
    iconClass: "fr-icon-flag-line",
    color: "white",
    bg: "danger",
  },
  "opening-hours": {
    label: "⏰ Horaires d'ouverture",
    variantClass: "fr-callout--yellow-tournesol",
    iconClass: "fr-icon-notification-3-line",
    color: "dark",
    bg: "warning",
  },
  general: {
    label: "Information générale",
    variantClass: "fr-callout--blue-ecume",
    iconClass: "fr-icon-information-line",
    color: "white",
    bg: "primary",
  },
  other: {
    label: "Autre information",
    variantClass: "",
    iconClass: "fr-icon-info-line",
    color: "dark",
    bg: "secondary",
  },
};
