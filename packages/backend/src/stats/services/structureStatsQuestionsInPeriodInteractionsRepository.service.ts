import { Between } from "typeorm";
import {
  interactionRepository,
  userUsagerLoginRepository,
} from "../../database";

import { StructureStatsQuestionsInPeriodInteractions } from "../../_common/model/structure-stats";
import { InteractionType } from "@domifa/common";

export const structureStatsQuestionsInPeriodInteractionsRepository = {
  getStats,
};

async function getStats({
  startDateUTC,
  endDateUTCExclusive,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTCExclusive: Date;
  structureId: number;
}): Promise<StructureStatsQuestionsInPeriodInteractions> {
  const visiteOut = await interactionRepository.countVisiteOut({
    dateInteractionBefore: endDateUTCExclusive,
    dateInteractionAfter: startDateUTC,
    structureId,
  });

  const visite = await countInteractions({
    dateInteractionBefore: endDateUTCExclusive,
    dateInteractionAfter: startDateUTC,
    structureId,
    interactionType: "visite",
  });

  const allVisites = visiteOut + visite;

  const stats: StructureStatsQuestionsInPeriodInteractions = {
    appel: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "appel",
    }),
    colisIn: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "colisIn",
    }),
    colisOut: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "colisOut",
    }),
    courrierIn: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "courrierIn",
    }),
    courrierOut: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "courrierOut",
    }),
    recommandeIn: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "recommandeIn",
    }),
    recommandeOut: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "recommandeOut",
    }),
    allVisites,
    visite,
    visiteOut,
    loginPortail: await userUsagerLoginRepository.count({
      where: {
        structureId,
        createdAt: Between(
          startDateUTC,
          endDateUTCExclusive
        ) as unknown as Date,
      },
    }),
  };

  return stats;
}

async function countInteractions({
  dateInteractionBefore,
  dateInteractionAfter,
  structureId,
  interactionType,
}: {
  dateInteractionBefore: Date;
  dateInteractionAfter: Date;
  structureId: number;
  interactionType: InteractionType;
}): Promise<number> {
  if (interactionType === "appel" || interactionType === "visite") {
    return interactionRepository.count({
      where: {
        structureId,
        type: interactionType,
        dateInteraction: Between(
          dateInteractionAfter,
          dateInteractionBefore
        ) as unknown as Date,
      },
    });
  }
  return (
    (await interactionRepository.sum("nbCourrier", {
      structureId,
      type: interactionType,
      dateInteraction: Between(
        dateInteractionAfter,
        dateInteractionBefore
      ) as unknown as Date,
    })) ?? 0
  );
}
