import { InteractionType } from "@domifa/common";

export const ALL_INTERACTION_TYPES: InteractionType[] = [
  "courrierIn",
  "courrierOut",
  "recommandeIn",
  "recommandeOut",
  "colisIn",
  "colisOut",
  "appel",
  "visite",
];

export const INTERACTION_OK_LIST: InteractionType[] = [
  "courrierOut",
  "visite",
  "appel",
  "colisOut",
  "recommandeOut",
];

export const INTERACTIONS_IN_OUT_OBJECTS: {
  in: InteractionType;
  out: InteractionType;
}[] = [
  {
    in: "courrierIn",
    out: "courrierOut",
  },
  {
    in: "recommandeIn",
    out: "recommandeOut",
  },
  {
    in: "colisIn",
    out: "colisOut",
  },
];

export const INTERACTIONS_IN_OUT_LIST: InteractionType[] =
  INTERACTIONS_IN_OUT_OBJECTS.map((io) => [io.in, io.out]).reduce(
    (acc, arr) => acc.concat(arr),
    [] as InteractionType[]
  );
