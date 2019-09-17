export class Interaction {
  public type: string;
  public dateInteraction: Date;
  public content?: string;
  public nbCourrier?: number;
  public usagerId: number;
  public structureId: number;
  public userName?: string;
  public userId: number;

  constructor(interaction?: any) {
    this.type = (interaction && interaction.dateInteraction) || "";
    this.dateInteraction =
      interaction && interaction.dateInteraction !== null
        ? new Date(interaction.dateInteraction)
        : null;
    this.type = (interaction && interaction.type) || "";
    this.content = (interaction && interaction.content) || "";
    this.nbCourrier = (interaction && interaction.nbCourrier) || 0;
    this.userName = (interaction && interaction.userName) || "";
  }
}
