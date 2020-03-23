import {
  interactionsLabels,
  interactionsLabelsPluriel
} from "../interactions.labels";

export type InteractionTypes =
  | "courrierIn"
  | "courrierOut"
  | "recommandeIn"
  | "recommandeOut"
  | "colisIn"
  | "colisOut"
  | "appel"
  | "visite";

export class Interaction {
  public id: string;
  public type: string;
  public dateInteraction: Date | null;
  public content?: string;
  public nbCourrier?: number;
  public usagerId: number;
  public structureId: number;
  public userName?: string;
  public userId: number;

  public delete: boolean;

  public label: string;

  constructor(interaction: any) {
    this.usagerId = (interaction && interaction.usagerId) || null;
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
    this.id = interaction._id;

    if (this.type !== "appel" && this.type !== "visite") {
      const nbCourrierTemp = !this.nbCourrier ? 1 : this.nbCourrier;
      this.label = nbCourrierTemp.toString() + " ";
      this.label =
        nbCourrierTemp > 1
          ? this.label + interactionsLabelsPluriel[this.type].toLowerCase()
          : this.label + interactionsLabels[this.type].toLowerCase();
    } else {
      this.label = interactionsLabels[this.type];
    }
  }
}
