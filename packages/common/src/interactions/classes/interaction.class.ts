import { InteractionType } from "./../types/InteractionType.type";
import {
  INTERACTIONS_LABELS_PLURIEL,
  INTERACTIONS_LABELS_SINGULIER,
} from "../constants";
import { type CommonInteraction } from "../interfaces";

export class Interaction implements CommonInteraction {
  public type: InteractionType;
  public dateInteraction: Date;
  public content?: string;
  public nbCourrier: number;
  public usagerRef: number;
  public structureId: number;
  public userName: string;
  public userId: number;
  public label: string;
  public uuid?: string;
  public procuration: boolean;
  public returnToSender?: boolean;
  public interactionOutUUID = null;
  public iconClass?: string;
  constructor(interaction: CommonInteraction) {
    this.uuid = interaction?.uuid;
    this.usagerRef = interaction?.usagerRef;
    this.procuration = interaction?.procuration;
    this.structureId = interaction?.structureId;
    this.userId = interaction?.userId;
    this.dateInteraction = new Date(interaction.dateInteraction);
    this.iconClass = getIconClassByTypeInteraction(interaction.type);
    this.type = interaction?.type || null;

    this.content = interaction?.content ?? "";
    this.nbCourrier = interaction?.nbCourrier || 0;
    this.userName = interaction?.userName || "";

    if (this.type !== "appel" && this.type !== "visite") {
      const nbCourrierTemp = this.nbCourrier || 1;
      const isPlural = nbCourrierTemp > 1;
      this.label = `${nbCourrierTemp} ${
        isPlural
          ? INTERACTIONS_LABELS_PLURIEL[this.type].toLowerCase()
          : INTERACTIONS_LABELS_SINGULIER[this.type].toLowerCase()
      }`;
    } else {
      this.label = INTERACTIONS_LABELS_SINGULIER[this.type];
    }
  }
}

export const getIconClassByTypeInteraction = (
  typeInteraction: InteractionType
): string => {
  switch (typeInteraction) {
    case "courrierIn":
      return "fr-icon-mail-open-line";
    case "courrierOut":
      return "fr-icon-mail-send-line";
    case "recommandeIn":
      return "fr-icon-mail-star-line";
    case "recommandeOut":
      return "fr-icon-mail-download-line";
    case "visite":
      return "fr-icon-user-line";
    case "appel":
      return "fr-icon-phone-line";
    case "colisIn":
      return "fr-icon-archive-line";
    case "colisOut":
      return "fr-icon-inbox-archive-line";
    default:
      return "";
  }
};
