import { StructureInformation } from "@domifa/common";
import { add, sub } from "date-fns";

export const unMessageCourant: StructureInformation = {
  uuid: "1",
  createdAt: new Date("2025-08-13T15:28:52.311Z"),
  updatedAt: new Date("2025-08-13T15:28:52.311Z"),
  version: 1,
  title: "Un message courant",
  description: "Un message",
  isTemporary: true,
  startDate: sub(new Date(), {
    days: 1,
  }),
  endDate: add(new Date(), {
    days: 1,
  }),
  type: "general",
  createdBy: {
    userId: 1,
    userName: "Patrick Roméro",
  },
  structureId: 1,
};

export const unMessagePasse: StructureInformation = {
  ...unMessageCourant,
  title: "Un message passé",
  startDate: sub(new Date(), {
    days: 4,
  }),
  endDate: sub(new Date(), {
    days: 1,
  }),
};

export const unMessageFutur: StructureInformation = {
  ...unMessageCourant,
  title: "Un message futur",
  startDate: add(new Date(), {
    days: 2,
  }),
  endDate: add(new Date(), {
    days: 4,
  }),
};

export const unMessageFuturAvecIsoDate = {
  ...unMessageCourant,
  title: "Un message futur",
  startDate: add(new Date(), {
    days: 2,
  }).toISOString(),
  endDate: add(new Date(), {
    days: 4,
  }).toISOString(),
};

export const unMessageAvecIsoDate = {
  ...unMessageCourant,
  title: "Un message courant avec text date",
  startDate: sub(new Date(), {
    days: 4,
  }).toISOString(),
  endDate: add(new Date(), {
    days: 1,
  }).toISOString(),
};
