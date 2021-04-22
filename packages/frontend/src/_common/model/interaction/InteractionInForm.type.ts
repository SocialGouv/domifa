import { InteractionIn } from ".";

export type InteractionInForm = {
  [key in InteractionIn]: {
    nbCourrier: number;
    content: string;
  };
};
