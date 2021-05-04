import { structureStatsAtDateGenerator } from ".";
import { structureStatsRepository } from "../../../database";
import { appLogger } from "../../../util";
import {
  StructureCommon,
  StructureStats,
  StructureStatsFull,
  StructureStatsQuestionsAtDate,
} from "../../../_common/model";
import {
  statsQuestionsCoreBuilder,
  statsQuestionsPeriodBuilder,
} from "../stats-questions-builder";

export const structureStatsInPeriodGenerator = {
  buildStatsInPeriod,
};
async function buildStatsInPeriod({
  structure,
  startDateUTC,
  endDateUTC,
}: {
  structure: StructureCommon;
  startDateUTC: Date;
  endDateUTC?: Date;
}): Promise<{
  stats: StructureStatsFull;
  startDate?: Date;
  endDate?: Date;
}> {
  statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(startDateUTC);
  if (endDateUTC) {
    statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(endDateUTC);
  }

  let startStats: StructureStats = await structureStatsRepository.findByStructureIdAndDate(
    {
      structureId: structure.id,
      statsDateUTC: startDateUTC,
    }
  );

  if (!startStats || startStats === null) {
    // NOT EXIST: on les génère à la volée
    startStats = await structureStatsAtDateGenerator.buildStructureStats({
      statsDateUTC: startDateUTC,
      structure,
      generated: true,
    });
    await structureStatsRepository.save(startStats);
  }
  if (new Date(startStats.date).getTime() > new Date(endDateUTC).getTime()) {
    // force endDate to be AFTER begin date
    endDateUTC = startStats.date;
  }

  let endStats: StructureStats = await structureStatsRepository.findByStructureIdAndDate(
    {
      structureId: structure.id,
      statsDateUTC: endDateUTC,
    }
  );

  if (!endStats || endStats === null) {
    // NOT EXIST: on les génère à la volée
    endStats = await structureStatsAtDateGenerator.buildStructureStats({
      statsDateUTC: endDateUTC,
      structure,
      generated: true,
    });
    await structureStatsRepository.save(endStats);
  }

  const questionsAtDatesDiff = getDiffQuestionsAtDates(
    startStats.questions,
    endStats.questions
  );

  const questionsPeriod = await statsQuestionsPeriodBuilder.buildQuestionsPeriod(
    {
      structureId: structure.id,
      startDateUTC,
      endDateUTC,
    }
  );

  const stats = {
    ...startStats,
    questions: {
      ...questionsAtDatesDiff,
      ...questionsPeriod,
    },
  };
  return {
    stats,
    startDate: convertLocalDateToUtcNoTime(startStats.date), // this date is not UTC : convert it to the response
    endDate: convertLocalDateToUtcNoTime(endStats.date), // this date is not UTC : convert it to the response
  };
}

function convertLocalDateToUtcNoTime(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
}

function getDiffQuestionsAtDates(
  A: StructureStatsQuestionsAtDate,
  B: StructureStatsQuestionsAtDate
): StructureStatsQuestionsAtDate {
  if (!B) {
    appLogger.error(
      `[structureStatsInPeriodGenerator.getDiffQuestionsAtDates] B is not defined`
    );
    return A;
  }
  if (!A) {
    appLogger.error(
      `[structureStatsInPeriodGenerator.getDiffQuestionsAtDates] A is not defined`
    );
    return B;
  }

  const questions: StructureStatsQuestionsAtDate = {
    Q_11: {
      REFUS: B.Q_11.REFUS,
      RADIE: B.Q_11.RADIE,
      VALIDE: B.Q_11.VALIDE,
      VALIDE_TOTAL: B.Q_11.VALIDE_TOTAL,
      VALIDE_AYANTS_DROIT: B.Q_11.VALIDE_AYANTS_DROIT,
    },
    Q_14: {
      CCAS: B.Q_14.CCAS - A.Q_14.CCAS,
      ASSO: B.Q_14.ASSO - A.Q_14.ASSO,
    },

    Q_19: {
      COUPLE_AVEC_ENFANT: B.Q_19.COUPLE_AVEC_ENFANT,
      COUPLE_SANS_ENFANT: B.Q_19.COUPLE_SANS_ENFANT,
      FEMME_ISOLE_AVEC_ENFANT: B.Q_19.FEMME_ISOLE_AVEC_ENFANT,
      FEMME_ISOLE_SANS_ENFANT: B.Q_19.FEMME_ISOLE_SANS_ENFANT,
      HOMME_ISOLE_AVEC_ENFANT: B.Q_19.HOMME_ISOLE_AVEC_ENFANT,
      HOMME_ISOLE_SANS_ENFANT: B.Q_19.HOMME_ISOLE_SANS_ENFANT,
    },
    /* AUTRES QUESTIONS DE L'ENTRETIEN */
    Q_21: {
      AUTRE: B.Q_21.AUTRE,
      ERRANCE: B.Q_21.ERRANCE,
      EXPULSION: B.Q_21.EXPULSION,
      HEBERGE_SANS_ADRESSE: B.Q_21.HEBERGE_SANS_ADRESSE,
      ITINERANT: B.Q_21.ITINERANT,
      RUPTURE: B.Q_21.RUPTURE,
      SORTIE_STRUCTURE: B.Q_21.SORTIE_STRUCTURE,
      VIOLENCE: B.Q_21.VIOLENCE,
      NON_RENSEIGNE: B.Q_21.NON_RENSEIGNE,
      RAISON_DEMANDE: B.Q_21.RAISON_DEMANDE,
    },

    /* SITUATION RESIDENTIELLE */
    Q_22: {
      AUTRE: B.Q_22.AUTRE,
      DOMICILE_MOBILE: B.Q_22.DOMICILE_MOBILE,
      HEBERGEMENT_SOCIAL: B.Q_22.HEBERGEMENT_SOCIAL,
      HEBERGEMENT_TIERS: B.Q_22.HEBERGEMENT_TIERS,
      HOTEL: B.Q_22.HOTEL,
      SANS_ABRI: B.Q_22.SANS_ABRI,
      NON_RENSEIGNE: B.Q_22.NON_RENSEIGNE,
    },
    USAGERS: {
      SEXE: {
        F: B.USAGERS.SEXE.F,
        H: B.USAGERS.SEXE.H,
      },
      TRANCHE_AGE: {
        T_0_14: B.USAGERS.TRANCHE_AGE.T_0_14,
        T_15_19: B.USAGERS.TRANCHE_AGE.T_15_19,
        T_20_24: B.USAGERS.TRANCHE_AGE.T_20_24,
        T_25_29: B.USAGERS.TRANCHE_AGE.T_25_29,
        T_30_34: B.USAGERS.TRANCHE_AGE.T_30_34,
        T_35_39: B.USAGERS.TRANCHE_AGE.T_35_39,
        T_40_44: B.USAGERS.TRANCHE_AGE.T_40_44,
        T_45_49: B.USAGERS.TRANCHE_AGE.T_45_49,
        T_50_54: B.USAGERS.TRANCHE_AGE.T_50_54,
        T_55_59: B.USAGERS.TRANCHE_AGE.T_55_59,
        T_60_64: B.USAGERS.TRANCHE_AGE.T_60_64,
        T_65_69: B.USAGERS.TRANCHE_AGE.T_65_69,
        T_70_74: B.USAGERS.TRANCHE_AGE.T_70_74,
        T_75_PLUS: B.USAGERS.TRANCHE_AGE.T_75_PLUS,
      },
    },
  };

  return questions;
}
