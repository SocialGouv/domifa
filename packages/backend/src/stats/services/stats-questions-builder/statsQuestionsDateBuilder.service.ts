import * as moment from "moment";
import { usagerRepository } from "../../../database";
import { StructureStatsQuestionsAtDate } from "../../../_common/model";
import { statsQuestionsCoreBuilder } from "./statsQuestionsCoreBuilder.service";

export const statsQuestionsDateBuilder = {
  buildQuestionsDate,
};

async function buildQuestionsDate({
  statsDateUTC,
  structureId,
}: {
  statsDateUTC: Date;
  structureId: number;
}): Promise<StructureStatsQuestionsAtDate> {
  statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(statsDateUTC);

  // End of stat day
  const statsDateEndOfDayUTC = moment
    .utc(statsDateUTC)
    .endOf("day")
    .subtract(1, "minute")
    .toDate();

  const now = new Date();
  if (statsDateEndOfDayUTC > now) {
    throw new Error(
      `Invalid statsDateUTC '${statsDateEndOfDayUTC.toISOString()}' > '${now.toISOString()} (statsDateUTC=${statsDateUTC.toISOString()})'`
    );
  }
  const questions: StructureStatsQuestionsAtDate = {
    Q_11: {
      REFUS: 0,
      RADIE: 0,
      VALIDE: 0,
      VALIDE_AYANTS_DROIT: 0,
      VALIDE_TOTAL: 0,
    },
    Q_14: {
      ASSO: 0,
      CCAS: 0,
    },
    Q_19: {
      COUPLE_AVEC_ENFANT: 0,
      COUPLE_SANS_ENFANT: 0,
      FEMME_ISOLE_AVEC_ENFANT: 0,
      FEMME_ISOLE_SANS_ENFANT: 0,
      HOMME_ISOLE_AVEC_ENFANT: 0,
      HOMME_ISOLE_SANS_ENFANT: 0,
    },
    Q_21: {
      AUTRE: 0,
      ERRANCE: 0,
      EXPULSION: 0,
      HEBERGE_SANS_ADRESSE: 0,
      ITINERANT: 0,
      RUPTURE: 0,
      SORTIE_STRUCTURE: 0,
      VIOLENCE: 0,
      NON_RENSEIGNE: 0,
      RAISON_DEMANDE: undefined,
    },
    Q_22: {
      DOMICILE_MOBILE: 0,
      HEBERGEMENT_SOCIAL: 0,
      HEBERGEMENT_TIERS: 0,
      HOTEL: 0,
      SANS_ABRI: 0,
      NON_RENSEIGNE: 0,
      AUTRE: 0,
    },
    USAGERS: {
      SEXE: undefined,
      TRANCHE_AGE: undefined,
    },
  };

  questions.USAGERS.SEXE = await usagerRepository.countBySexe({
    structureId,
    actifsInHistoryBefore: statsDateEndOfDayUTC,
  });
  questions.USAGERS.TRANCHE_AGE = await usagerRepository.countByTranchesAge({
    structureId,
    actifsInHistoryBefore: statsDateEndOfDayUTC,
    ageReferenceDate: statsDateEndOfDayUTC,
  });

  questions.Q_11.VALIDE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
  });

  questions.Q_11.VALIDE_AYANTS_DROIT = await usagerRepository.countAyantsDroits(
    {
      structureId,
      actifsInHistoryBefore: statsDateEndOfDayUTC,
    }
  );

  questions.Q_11.VALIDE_TOTAL =
    questions.Q_11.VALIDE_AYANTS_DROIT + questions.Q_11.VALIDE;

  questions.Q_11.REFUS = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "REFUS",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
  });

  questions.Q_11.RADIE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "RADIE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
  });

  questions.Q_14.ASSO = await usagerRepository.countDomiciliations({
    structureId,
    decisionInHistory: {
      statut: "REFUS",
      dateDecisionBefore: statsDateEndOfDayUTC,
      orientation: "asso",
    },
  });
  questions.Q_14.CCAS = await usagerRepository.countDomiciliations({
    structureId,
    decisionInHistory: {
      statut: "REFUS",
      dateDecisionBefore: statsDateEndOfDayUTC,
      orientation: "ccas",
    },
  });

  questions.Q_19.COUPLE_AVEC_ENFANT = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        typeMenage: "COUPLE_AVEC_ENFANT",
      },
    }
  );

  questions.Q_19.COUPLE_SANS_ENFANT = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        typeMenage: "COUPLE_SANS_ENFANT",
      },
    }
  );

  questions.Q_19.FEMME_ISOLE_AVEC_ENFANT = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
      },
    }
  );

  questions.Q_19.FEMME_ISOLE_SANS_ENFANT = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        typeMenage: "FEMME_ISOLE_SANS_ENFANT",
      },
    }
  );

  questions.Q_19.HOMME_ISOLE_AVEC_ENFANT = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        typeMenage: "HOMME_ISOLE_AVEC_ENFANT",
      },
    }
  );

  questions.Q_19.HOMME_ISOLE_SANS_ENFANT = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        typeMenage: "HOMME_ISOLE_SANS_ENFANT",
      },
    }
  );

  questions.Q_21.ERRANCE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "ERRANCE",
    },
  });

  questions.Q_21.EXPULSION = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "EXPULSION",
    },
  });

  questions.Q_21.HEBERGE_SANS_ADRESSE = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        cause: "HEBERGE_SANS_ADRESSE",
      },
    }
  );

  questions.Q_21.ITINERANT = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "ITINERANT",
    },
  });

  questions.Q_21.SORTIE_STRUCTURE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "SORTIE_STRUCTURE",
    },
  });

  questions.Q_21.VIOLENCE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "VIOLENCE",
    },
  });

  questions.Q_21.NON_RENSEIGNE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "NON_RENSEIGNE",
    },
  });

  questions.Q_21.AUTRE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "AUTRE",
    },
  });

  questions.Q_21.RUPTURE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      cause: "RUPTURE",
    },
  });
  questions.Q_21.RAISON_DEMANDE = await usagerRepository.countByRaisonDemande({
    structureId,
    actifsInHistoryBefore: statsDateEndOfDayUTC,
  });
  questions.Q_22.AUTRE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      residence: "AUTRE",
    },
  });
  questions.Q_22.DOMICILE_MOBILE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      residence: "DOMICILE_MOBILE",
    },
  });

  questions.Q_22.HEBERGEMENT_SOCIAL = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        residence: "HEBERGEMENT_SOCIAL",
      },
    }
  );

  questions.Q_22.HEBERGEMENT_TIERS = await usagerRepository.countDomiciliations(
    {
      structureId,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: statsDateEndOfDayUTC,
      },
      entretien: {
        residence: "HEBERGEMENT_TIERS",
      },
    }
  );

  questions.Q_22.HOTEL = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      residence: "HOTEL",
    },
  });

  questions.Q_22.SANS_ABRI = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      residence: "SANS_ABRI",
    },
  });

  questions.Q_22.NON_RENSEIGNE = await usagerRepository.countDomiciliations({
    structureId,
    decision: {
      statut: "VALIDE",
      dateDecisionBefore: statsDateEndOfDayUTC,
    },
    entretien: {
      residence: "NON_RENSEIGNE",
    },
  });
  return questions;
}
