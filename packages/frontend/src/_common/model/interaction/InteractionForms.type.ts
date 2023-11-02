import { InteractionIn, InteractionOut } from "@domifa/common";

export type InteractionInForm = {
  [key in InteractionIn]: {
    nbCourrier: number;
    content: string | null;
  };
};

export type InteractionOutForm = {
  [key in InteractionOut]: {
    procurationIndex: 0 | 1 | null;
    nbCourrier: number;
    selected: boolean;
  };
};
