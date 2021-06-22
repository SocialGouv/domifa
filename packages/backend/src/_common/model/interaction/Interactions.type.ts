import { AppEntity, InteractionEvent } from "..";
import { InteractionType } from "./InteractionType.type";

export type Interactions = AppEntity & {
  id?: number;
  createdAt?: Date;
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
  previousValue?: Interactions; // if event === 'delete'
};
