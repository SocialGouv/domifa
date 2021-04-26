import { InteractionOut } from ".";

export type InteractionOutForm = {
  [key in InteractionOut]: {
    nbCourrier: number;
    selected: boolean;
    procuration: boolean;
  };
};
