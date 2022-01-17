import { MessageSmsReminders } from ".";
import { InteractionType } from "../interaction";

export type MessageSmsId = InteractionType | MessageSmsReminders;

export type InteractionTypeStats =
  | "courrierIn"
  | "colisIn"
  | "echeanceDeuxMois"
  | "recommandeIn";
