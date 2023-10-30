import { InteractionType } from "@domifa/common";

export type InteractionInForApi = {
  nbCourrier: number;
  type: InteractionType;
  content: string | null;
};

export type InteractionOutForApi = {
  type: InteractionType;
  procurationIndex: number | null;
};
