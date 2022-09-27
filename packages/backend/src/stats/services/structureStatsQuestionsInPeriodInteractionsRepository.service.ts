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
    visiteOut: await interactionRepository.countVisiteOut({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
    }),
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
  } else {
    const { sum } = await interactionRepository
      .createQueryBuilder("interactions")
      .select("SUM(interactions.nbCourrier)", "sum")
      .where({
        structureId,
        type: interactionType,
        event: "create",
        dateInteraction: Between(
          dateInteractionAfter,
          dateInteractionBefore
        ) as unknown as Date,
      })
      .getRawOne();

    return sum ? parseInt(sum, 10) : 0;
  }
}
