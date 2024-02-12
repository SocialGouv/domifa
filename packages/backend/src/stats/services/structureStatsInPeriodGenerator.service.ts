import { subDays } from "date-fns";

import {
  structureRepository,
  usagerHistoryStatesRepository,
} from "../../database";
import { statsQuestionsCoreBuilder } from "./statsQuestionsCoreBuilder.service";
import { structureStatsQuestionsInPeriodInteractionsRepository } from "./structureStatsQuestionsInPeriodInteractionsRepository.service";
import { Structure, StructureStatsFull } from "@domifa/common";

export const structureStatsInPeriodGenerator = {
  buildStatsInPeriod,
};
async function buildStatsInPeriod({
  structureId,
  startDateUTC,
  endDateUTCExclusive,
}: {
  structureId: number;
  startDateUTC: Date;
  endDateUTCExclusive?: Date;
}): Promise<StructureStatsFull> {
  const structure: Pick<
    Structure,
    "id" | "nom" | "importDate" | "registrationDate"
  > = await structureRepository.findOne({
    where: {
      id: structureId,
    },
    select: { id: true, nom: true, importDate: true, registrationDate: true },
  });

  statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(startDateUTC);
  if (endDateUTCExclusive) {
    statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(
      endDateUTCExclusive
    );
  }
  if (
    new Date(startDateUTC).getTime() > new Date(endDateUTCExclusive).getTime()
  ) {
    // force endDate to be AFTER begin date
    endDateUTCExclusive = startDateUTC;
  }

  const validUsagers =
    await usagerHistoryStatesRepository.getStructureStatsQuestionsAtDateValidUsagers(
      {
        dateUTC: endDateUTCExclusive,
        structureId: structure.id,
      }
    );

  const decisions =
    await usagerHistoryStatesRepository.getStructureStatsQuestionsInPeriodDecisions(
      {
        startDateUTC,
        endDateUTCExclusive,
        structureId: structure.id,
      }
    );

  const interactions =
    await structureStatsQuestionsInPeriodInteractionsRepository.getStats({
      startDateUTC,
      endDateUTCExclusive,
      structureId: structure.id,
    });

  const stats: StructureStatsFull = {
    structure: {
      id: structure.id,
      nom: structure.nom,
      importDate: structure.importDate,
      registrationDate: structure.registrationDate,
    },
    period: {
      startDateUTC,
      endDateUTC: subDays(new Date(endDateUTCExclusive), 1),
      endDateUTCExclusive,
    },
    data: {
      validUsagers,
      decisions,
      interactions,
    },
  };

  return stats;
}
