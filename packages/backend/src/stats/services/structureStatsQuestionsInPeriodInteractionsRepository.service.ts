import { Between } from "typeorm";
import {
  interactionRepository,
  userUsagerLoginRepository,
} from "../../database";

import { StructureStatsQuestionsInPeriodInteractions } from "@domifa/common";

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
  const totalInteractions =
    await interactionRepository.totalInteractionsInPeriod({
      dateInteractionBefore: endDateUTCExclusive,
      dateInteractionAfter: startDateUTC,
      structureId,
    });

  const visiteOut = await interactionRepository.countVisiteOut({
    dateInteractionBefore: endDateUTCExclusive,
    dateInteractionAfter: startDateUTC,
    structureId,
  });

  const allVisites = visiteOut + totalInteractions.visite;

  const stats: StructureStatsQuestionsInPeriodInteractions = {
    ...totalInteractions,
    allVisites,
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
