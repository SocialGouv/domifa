import {
  INTERACTIONS_LABELS_PLURIEL,
  INTERACTIONS_LABELS_SINGULIER,
} from "../constants";
import { type CommonInteraction } from "../interfaces";
import { type InteractionType } from "../types";

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

  constructor(interaction: CommonInteraction) {
    this.uuid = interaction?.uuid;
    this.usagerRef = interaction?.usagerRef;
    this.procuration = interaction?.procuration;
    this.structureId = interaction?.structureId;
    this.userId = interaction?.userId;
    this.dateInteraction = new Date(interaction.dateInteraction);

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
