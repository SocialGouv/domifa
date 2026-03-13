import { InteractionType } from "@domifa/common";

export const INTERACTION_ICONS: Record<
  InteractionType,
  { icon: string; label: string }
> = {
  courrierIn: {
    icon: "fr-icon-mail-check-line",
    label: "Courrier entrant",
  },
  courrierOut: {
    icon: "fr-icon-mail-send-line",
    label: "Courrier sortant",
  },
  recommandeIn: {
    icon: "fr-icon-mail-check-line",
    label: "Recommandé entrant",
  },
  recommandeOut: {
    icon: "fr-icon-mail-check-line",
    label: "Recommandé sortant",
  },
  colisIn: {
    icon: "fr-icon-inbox-line",
    label: "Colis entrant",
  },
  colisOut: {
    icon: "fr-icon-send-plane-2-line",
    label: "Colis sortant",
  },
  appel: {
    icon: "fr-icon-phone-line",
    label: "Appel",
  },
  visite: {
    icon: "fr-icon-walk-line",
    label: "Visite",
  },
} as const;
