import {
  InteractionType,
  Interactions,
  InteractionEvent,
  INTERACTIONS_LABELS_PLURIEL,
  INTERACTIONS_LABELS_SINGULIER,
} from "../../../../_common/model/interaction";

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
    this.event = interaction?.event || "create";
    this.previousValue = interaction?.previousValue;
    this.uuid = interaction?.uuid;

    this.usagerRef = interaction?.usagerRef || null;
    this.structureId = interaction?.structureId || null;
    this.userId = interaction?.userId || null;
    this.dateInteraction = interaction?.dateInteraction
      ? new Date(interaction.dateInteraction)
      : null;

    this.type = interaction?.type || null;

    this.content = interaction?.content || "";
    this.nbCourrier = interaction?.nbCourrier || 0;
    this.userName = interaction?.userName || "";

    if (
      this.type !== "appel" &&
      this.type !== "visite" &&
      this.type !== "npai"
    ) {
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
