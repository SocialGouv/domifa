import { AppEntity, InteractionEvent } from "..";
import { InteractionType } from "./InteractionType.type";

export type Interactions = AppEntity & {
  content?: string;
  dateInteraction: Date;
  nbCourrier: number;
  structureId: number;
  type: InteractionType;
  usagerRef: number;
  usagerUUID: string;
  userId: number;
  userName: string;
  event: InteractionEvent;
  interactionOutUUID: string | null;
  previousValue?: Interactions; // if event === 'delete'
  interactionOut?: Interactions; // si interaction entrante, on associe la distribution
};
