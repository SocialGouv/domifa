import { interactionsLabels } from "../interactions.labels";

export class Interaction {
  public id: string;
  public type: string;
  public dateInteraction: Date;
  public content?: string;
  public nbCourrier?: number;
  public usagerId: number;
  public structureId: number;
  public userName?: string;
  public userId: number;

  public delete: boolean;

  public label: string;

  constructor(interaction: any) {
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

    this.label = interactionsLabels[this.type];

    if (this.nbCourrier && this.nbCourrier > 0) {
      this.label = this.nbCourrier.toString() + " " + this.label.toLowerCase();
    }
  }
}
