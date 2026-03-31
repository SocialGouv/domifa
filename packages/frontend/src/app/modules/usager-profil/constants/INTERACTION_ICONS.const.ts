import { InteractionType } from "@domifa/common";

export const INTERACTION_ICONS: Record<
  InteractionType,
  { icon: string; label: string }
> = {
  courrierIn: {
    icon: "ri-mail-download-line",
    label: "Courrier entrant",
  },
  courrierOut: {
    icon: "ri-mail-check-fill",
    label: "Courrier sortant",
  },
  recommandeIn: {
    icon: "ri-mail-send-line",
    label: "Recommandé entrant",
  },
  recommandeOut: {
    icon: "ri-mail-send-fill",
    label: "Recommandé sortant",
  },
  colisIn: {
    icon: "ri-inbox-archive-line",
    label: "Colis entrant",
  },
  colisOut: {
    icon: "ri-inbox-unarchive-fill",
    label: "Colis sortant",
  },
  appel: {
    icon: "fr-icon-phone-line",
    label: "Appel",
  },
  visite: {
    icon: "ri-walk-fill",
    label: "Visite",
  },
} as const;
