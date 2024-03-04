import { type AppEntity } from "../../_core";
import { type InteractionType } from "../types";

export interface CommonInteraction extends AppEntity {
  createdAt?: Date;
  content?: string;
  dateInteraction: Date;
  nbCourrier: number;
  structureId: number;
  type: InteractionType;
  usagerRef: number;
  usagerUUID?: string;
  userId: number;
  userName: string;
  interactionOutUUID: string | null;
  procuration: boolean;
  returnToSender?: boolean;
}
