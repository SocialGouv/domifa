import { InteractionType } from ".";

export type InteractionInForApi = {
  nbCourrier: number;
  type: InteractionType;
  content: string | null;
};

export type InteractionOutForApi = {
  nbCourrier: number;
  type: InteractionType;
  procurationIndex: number | null;
};
