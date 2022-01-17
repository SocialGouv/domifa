export type InteractionType =
  | "courrierIn"
  | "courrierOut"
  | "recommandeIn"
  | "recommandeOut"
  | "colisIn"
  | "colisOut"
  | "appel"
  | "visite"
  | "npai";

export const INTERACTION_OK_LIST: InteractionType[] = [
  "courrierOut",
  "visite",
  "appel",
  "colisOut",
  "recommandeOut",
];

export const INTERACTION_IN_OUT_OBJECTS: {
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

export const INTERACTION_IN_OUT_LIST: InteractionType[] =
  INTERACTION_IN_OUT_OBJECTS.map((io) => [io.in, io.out]).reduce(
    (acc, arr) => acc.concat(arr),
    [] as InteractionType[]
  );

export const INTERACTION_IN_CREATE_SMS: InteractionType[] = [
  "courrierIn",
  "colisIn",
  "recommandeIn",
];

export const INTERACTION_OUT_REMOVE_SMS: InteractionType[] = [
  "courrierOut",
  "colisOut",
  "recommandeOut",
];
