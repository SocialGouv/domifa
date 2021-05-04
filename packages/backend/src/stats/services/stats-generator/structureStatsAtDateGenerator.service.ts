import {
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  structureCommonRepository,
  structureLightRepository,
  structureStatsRepository,
  StructureStatsTable,
} from "../../../database";
import { appLogger } from "../../../util";
import { StructureLight } from "../../../_common/model";
import {
  statsQuestionsCoreBuilder,
  statsQuestionsDateBuilder,
} from "../stats-questions-builder";

const MAX_ERRORS = 10;

export const structureStatsAtDateGenerator = {
  generateStats,
  generateStructureStats,
  buildStructureStats,
};

async function generateStats(trigger: MonitoringBatchProcessTrigger) {
  appLogger.debug(
    "[StatsGeneratorService] START statistics generation : " +
      new Date().toISOString()
  );

  await monitoringBatchProcessSimpleCountRunner.monitorProcess(
    {
      processId: "generate-structures-stats",
      trigger,
    },
    async ({ monitorTotal, monitorSuccess, monitorError }) => {
      const statsDateUTC = statsQuestionsCoreBuilder.buildStatsDateUTC({
        date: "yesterday",
      });
      const structures = await structureLightRepository.findStructuresToGenerateStats(
        {
          statsDateUTC,
        }
      );

      appLogger.debug(
        `[StatsGeneratorService] ${structures.length} structures to process :`
      );
      monitorTotal(structures.length);

      for (const structure of structures) {
        try {
          await generateStructureStats(statsDateUTC, structure, false);
          monitorSuccess();
        } catch (err) {
          const totalErrors = monitorError(err);
          if (totalErrors >= MAX_ERRORS) {
            appLogger.warn(
              `[StatsGeneratorService] Too many errors: skip next structure: ${err.message}`,
              {
                sentryBreadcrumb: true,
              }
            );
            break;
          }
        }
      }
    }
  );
}

async function generateStructureStats(
  statsDateUTC: Date,
  structure: StructureLight,
  generated: boolean
) {
  const stat = await buildStructureStats({
    structure,
    statsDateUTC,
    generated,
  });

  const retourStats = await structureStatsRepository.save(stat);

  const [valide, refus, radie] = [
    stat.questions.Q_11.VALIDE,
    stat.questions.Q_11.REFUS,
    stat.questions.Q_11.RADIE,
  ];
  const total = valide + refus + radie;

  const updateStructureStats = await structureCommonRepository.updateOne(
    { id: structure.id },
    {
      stats: { TOTAL: total, VALIDE: valide, REFUS: refus, RADIE: radie },
    }
  );

  return { retourStats, updateStructureStats };
}

async function buildStructureStats({
  statsDateUTC,
  structure,
  generated,
}: {
  statsDateUTC: Date;
  structure: StructureLight;
  generated: boolean;
}): Promise<StructureStatsTable> {
  const questions = await statsQuestionsDateBuilder.buildQuestionsDate({
    statsDateUTC,
    structureId: structure.id,
  });

  const stat = new StructureStatsTable({
    date: statsDateUTC,
    questions,
    capacite: structure.capacite,
    structureId: structure.id,
    nom: structure.nom,
    structureType: structure.structureType,
    ville: structure.ville,
    codePostal: structure.codePostal,
    departement: structure.departement,
    generated: generated,
  });
  return stat;
}
