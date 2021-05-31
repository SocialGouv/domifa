import moment = require("moment");
import { structureRepository } from "../../database";
import { Structure, StructureStatsFull } from "../../_common/model";
import { statsQuestionsCoreBuilder } from "./statsQuestionsCoreBuilder.service";
import { structureStatsQuestionsAtDateValidUsagersRepository } from "./structureStatsQuestionsAtDateValidUsagersRepository.service";
import { structureStatsQuestionsInPeriodDecisionsRepository } from "./structureStatsQuestionsInPeriodDecisionsRepository.service";
import { structureStatsQuestionsInPeriodInteractionsRepository } from "./structureStatsQuestionsInPeriodInteractionsRepository.service";

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
  const structure = await structureRepository.findOne<
    Pick<Structure, "id" | "nom" | "importDate" | "registrationDate">
  >(
    {
      id: structureId,
    },
    {
      select: ["id", "nom", "importDate", "registrationDate"],
    }
  );

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
    await structureStatsQuestionsAtDateValidUsagersRepository.getStats({
      dateUTC: endDateUTCExclusive,
      structureId: structure.id,
    });
  const decisions =
    await structureStatsQuestionsInPeriodDecisionsRepository.getStats({
      startDateUTC,
      endDateUTCExclusive,
      structureId: structure.id,
    });
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
      endDateUTC: moment.utc(endDateUTCExclusive).add(-1, "day").toDate(),
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
