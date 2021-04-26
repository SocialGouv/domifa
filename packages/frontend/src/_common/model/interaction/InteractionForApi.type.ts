import { InteractionType } from ".";

export type InteractionForApi = {
  nbCourrier: number;
  type: InteractionType;
  procuration?: boolean;
  content?: string;
};
