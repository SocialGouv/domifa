import { InteractionType } from "@domifa/common";
import { AppEntity } from "..";

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
  interactionOutUUID: string | null;
  interactionOut?: Interactions; // si interaction entrante, on associe la distribution
};
