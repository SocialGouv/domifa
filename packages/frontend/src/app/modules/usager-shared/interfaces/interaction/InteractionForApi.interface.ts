import { InteractionType } from "@domifa/common";

export interface InteractionInForApi {
  nbCourrier: number;
  type: InteractionType;
  content: string | null;
}

export interface InteractionOutForApi {
  type: InteractionType;
  procurationIndex: number | null;
  returnToSender: boolean | null;
}
