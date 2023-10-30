import { AppEntity } from "..";

import { InteractionType, InteractionEvent } from "@domifa/common";

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
  uuid: string;
  event: InteractionEvent;
  previousValue?: Interactions; // if event === 'delete'
};
