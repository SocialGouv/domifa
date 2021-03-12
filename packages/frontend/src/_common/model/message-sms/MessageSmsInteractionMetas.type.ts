import { InteractionType } from "../interaction";

export type MessageSmsInteractionMetas = {
  nbCourrier: number;
  interactionType: InteractionType;
  date: Date;
};
