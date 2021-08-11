import {
  InteractionEvent,
  Interactions,
} from "../../../../_common/model/interaction";

import {
  INTERACTIONS_LABELS_PLURIEL,
  INTERACTIONS_LABELS_SINGULIER,
} from "../../../../_common/model/interaction/constants";

export class Interaction {
  public _id: string;
  public id: number;
  public type: string;
  public dateInteraction: Date | null;
  public content?: string;
  public nbCourrier?: number;
  public usagerRef: number;
  public structureId: number;
  public userName?: string;
  public userId: number;

  public delete: boolean;

  public label: string;

  event: InteractionEvent;
  previousValue?: Interactions; // if event === 'delete'

  constructor(interaction: any) {
    this.event = interaction?.event;
    this.previousValue = interaction?.previousValue;
    this.usagerRef = (interaction && interaction.usagerRef) || null;
    this.structureId = (interaction && interaction.structureId) || null;
    this.userId = (interaction && interaction.userId) || null;
    this.dateInteraction =
      interaction && interaction.dateInteraction !== null
        ? new Date(interaction.dateInteraction)
        : null;

    this.type = (interaction && interaction.type) || "";
    this.content = (interaction && interaction.content) || "";
    this.nbCourrier = (interaction && interaction.nbCourrier) || 0;
    this.userName = (interaction && interaction.userName) || "";

    this.delete = false;
    this.id = interaction.id;

    if (
      this.type !== "appel" &&
      this.type !== "visite" &&
      this.type !== "npai"
    ) {
      console.log(this.type);
      const nbCourrierTemp = !this.nbCourrier ? 1 : this.nbCourrier;
      this.label = nbCourrierTemp.toString() + " ";
      console.log(nbCourrierTemp);

      this.label =
        nbCourrierTemp > 1
          ? this.label + INTERACTIONS_LABELS_PLURIEL[this.type].toLowerCase()
          : this.label + INTERACTIONS_LABELS_SINGULIER[this.type].toLowerCase();
    } else {
      this.label = INTERACTIONS_LABELS_SINGULIER[this.type];
    }
  }
}
