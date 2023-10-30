import { type InteractionType } from "../../interactions";

export interface MessageSmsInteractionMetas {
  nbCourrier: number;
  interactionType: InteractionType;
  date: Date;
}
