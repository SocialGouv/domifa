import { type AppEntity } from "../../_core";
import { type InteractionType } from "../types";

export interface CommonInteraction extends AppEntity {
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
  uuid: string;
}
