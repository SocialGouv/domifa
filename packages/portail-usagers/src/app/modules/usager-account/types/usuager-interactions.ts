import { InteractionType } from "@domifa/common";

export type DateGroupedInteractions = {
  [date: string]: {
    numberOfItems: number;
    comments: string[];
  };
};

export type TypeGroupedInteractions = {
  [key in InteractionType]?: DateGroupedInteractions;
};

export type pendingInteractionsCount = {
  [key in InteractionType]?: number;
};
