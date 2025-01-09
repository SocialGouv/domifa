import { INTERACTIONS_IN, UsagerLastInteraction } from "@domifa/common";

export const countStandByInteractions = (
  lastInteraction: UsagerLastInteraction
): number => {
  let standByInteractions = 0;
  INTERACTIONS_IN.forEach((interaction) => {
    standByInteractions += lastInteraction[interaction];
  });
  return standByInteractions;
};
