import { Between } from "typeorm";
import { interactionRepository } from "../../database";
import { InteractionType } from "../../_common/model";
import { StructureStatsQuestionsInPeriodInteractions } from "../../_common/model/structure-stats";

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
    visite: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "visite",
    }),
    npai: await countInteractions({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "npai",
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
    //
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
  } else {
    return await interactionRepository.sum({
      sumAttribute: "nbCourrier",
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
}
