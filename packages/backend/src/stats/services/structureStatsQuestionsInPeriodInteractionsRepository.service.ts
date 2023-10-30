import { Between } from "typeorm";
import { interactionRepository } from "../../database";

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
    npai: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "npai",
    }),
    loginPortail: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "loginPortail",
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
  if (
    interactionType === "appel" ||
    interactionType === "visite" ||
    interactionType === "loginPortail" ||
    interactionType === "npai"
  ) {
    return interactionRepository.count({
      where: {
        structureId,
        type: interactionType,
        event: "create",
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
      event: "create",
      dateInteraction: Between(
        dateInteractionAfter,
        dateInteractionBefore
      ) as unknown as Date,
    })) ?? 0
  );
}
