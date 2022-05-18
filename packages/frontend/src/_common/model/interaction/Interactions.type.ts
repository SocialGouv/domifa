import { AppEntity } from "..";
import { InteractionEvent } from "./InteractionEvent.type";
import { InteractionType } from "./InteractionType.type";

export type Interactions = AppEntity & {
  id?: number | null;
  createdAt?: Date;
  content?: string;
  dateInteraction: Date | null;
  nbCourrier: number;
  structureId: number | null;
  type: InteractionType;
  usagerRef: number | null;
  usagerUUID?: string | null;
  userId: number | null;
  userName: string | null;

  event: InteractionEvent;
  previousValue?: Interactions; // if event === 'delete'
};
