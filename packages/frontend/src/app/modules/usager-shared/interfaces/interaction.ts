import { InteractionType } from "./../../../../_common/model/interaction/InteractionType.type";
import {
  InteractionEvent,
  Interactions,
} from "../../../../_common/model/interaction";

import {
  INTERACTIONS_LABELS_PLURIEL,
  INTERACTIONS_LABELS_SINGULIER,
} from "../../../../_common/model/interaction/constants";

export class Interaction implements Interactions {
  public type: InteractionType;
  public dateInteraction: Date | null;
  public content?: string;
  public nbCourrier: number;
  public usagerRef: number | null;
  public structureId: number | null;
  public userName: string | null;
  public userId: number | null;
  public label: string;
  public uuid: string;
  public event: InteractionEvent;
  public previousValue?: Interactions; // if event === 'delete'

  constructor(interaction: Interactions) {
    this.event = interaction?.event;
    this.previousValue = interaction?.previousValue;
    this.usagerRef = (interaction && interaction.usagerRef) || null;
    this.structureId = (interaction && interaction.structureId) || null;
    this.userId = (interaction && interaction.userId) || null;
    this.dateInteraction =
      interaction && interaction.dateInteraction !== null
        ? new Date(interaction.dateInteraction)
        : null;

    this.type = (interaction && interaction.type) || null;
    this.content = (interaction && interaction.content) || "";
    this.nbCourrier = (interaction && interaction.nbCourrier) || 0;
    this.userName = (interaction && interaction.userName) || "";

    this.uuid = (interaction && interaction.uuid) || null;

    if (
      this.type !== "appel" &&
      this.type !== "visite" &&
      this.type !== "npai"
    ) {
      const nbCourrierTemp = !this.nbCourrier ? 1 : this.nbCourrier;
      this.label = nbCourrierTemp.toString() + " ";

      this.label =
        nbCourrierTemp > 1
          ? this.label + INTERACTIONS_LABELS_PLURIEL[this.type].toLowerCase()
          : this.label + INTERACTIONS_LABELS_SINGULIER[this.type].toLowerCase();
    } else {
      this.label = INTERACTIONS_LABELS_SINGULIER[this.type];
    }
  }
}
