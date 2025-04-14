import { Between } from "typeorm";

import { StructureStatsQuestionsInPeriodInteractions } from "@domifa/common";
import {
  interactionRepository,
  userUsagerLoginRepository,
} from "../../../database";

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

  const loginPortail = await userUsagerLoginRepository.count({
    where: {
      structureId,
      createdAt: Between(startDateUTC, endDateUTCExclusive) as unknown as Date,
    },
  });

  const stats: StructureStatsQuestionsInPeriodInteractions = {
    ...totalInteractions,
    allVisites,
    visiteOut,
    loginPortail,
    usagerRef: 0,
  };

  return stats;
}
