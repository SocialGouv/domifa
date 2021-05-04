import moment = require("moment");
import {
  usagerHistoryStatsPeriodRepository
} from "../../../database";
import { StructureStatsQuestionsInPeriod } from "../../../_common/model";
import { statsQuestionsCoreBuilder } from "./statsQuestionsCoreBuilder.service";

export const statsQuestionsPeriodBuilder = {
  buildQuestionsPeriod,
};

async function buildQuestionsPeriod({
  startDateUTC,
  endDateUTC,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTC: Date;
  structureId: number;
}): Promise<StructureStatsQuestionsInPeriod> {
  statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(startDateUTC);
  statsQuestionsCoreBuilder.expectDateToHaveNoUtcHoursMinutes(endDateUTC);
  endDateUTC = moment
    .utc(endDateUTC)
    .endOf("day")
    .subtract(1, "minute")
    .toDate();

  const questions: StructureStatsQuestionsInPeriod = {
    Q_10: 0,
    Q_10_A: 0,
    Q_10_B: 0,
    Q_12: {
      AUTRE: 0,
      A_SA_DEMANDE: 0,
      ENTREE_LOGEMENT: 0,
      FIN_DE_DOMICILIATION: 0,
      NON_MANIFESTATION_3_MOIS: 0,
      NON_RESPECT_REGLEMENT: 0,
      PLUS_DE_LIEN_COMMUNE: 0,
      TOTAL: 0,
    },
    Q_13: {
      AUTRE: 0,
      HORS_AGREMENT: 0,
      LIEN_COMMUNE: 0,
      SATURATION: 0,
      TOTAL: 0,
    },
    Q_20: {
      appel: 0,
      colisIn: 0,
      colisOut: 0,
      courrierIn: 0,
      courrierOut: 0,
      recommandeIn: 0,
      recommandeOut: 0,
      npai: 0,
      visite: 0,
    },
  };

  // Q10 : Nombre total d'attestations d'élection de domicile délivrées au cours de l'année
  questions.Q_10 = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "VALIDE",
        },
      },
      logSql: true,
    }
  );

  // Q10A : Dont première demande conclue par une attestation d'élection de domicile
  questions.Q_10_A = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        typeDom: "PREMIERE",
        decision: {
          statut: "VALIDE",
        },
      },
      logSql: false,
    }
  );

  // Q10B : Dont renouvellement
  questions.Q_10_B = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        typeDom: "RENOUVELLEMENT",
        decision: {
          statut: "VALIDE",
        },
      },
      logSql: false,
    }
  );

  // Q12 :Nombre total de radiations en 2018, tous organismes confondus
  // Q12A : Principaux motifs de radiations indiqués par les organismes non-visés par un agrément préfectoral
  // Q12B : Principaux motifs de radiation indiqués par les organismes agréés à la domiciliation
  questions.Q_12.TOTAL =  await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
        },
      },
      logSql: false,
    }
  );

  questions.Q_12.A_SA_DEMANDE =await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "A_SA_DEMANDE",
        },
      },
      logSql: false,
    }
  );
  questions.Q_12.AUTRE = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "AUTRE",
        },
      },
      logSql: false,
    }
  );

  questions.Q_12.ENTREE_LOGEMENT =await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "ENTREE_LOGEMENT",
        },
      },
      logSql: false,
    }
  );
  questions.Q_12.FIN_DE_DOMICILIATION = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "FIN_DE_DOMICILIATION",
        },
      },
      logSql: false,
    }
  );
  );

  questions.Q_12.NON_MANIFESTATION_3_MOIS = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "NON_MANIFESTATION_3_MOIS",
        },
      },
      logSql: false,
    }
  );
  questions.Q_12.NON_RESPECT_REGLEMENT = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "NON_RESPECT_REGLEMENT",
        },
      },
      logSql: false,
    }
  );

  questions.Q_12.PLUS_DE_LIEN_COMMUNE =await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "RADIE",
          motif: "PLUS_DE_LIEN_COMMUNE",
        },
      },
      logSql: false,
    }
  );

  // Q13: Nombre total de refus d'élection de domicile (y compris refus de renouvellement) en 2018, tous organismes confondus
  // Q13A : Principal motif de refus d'élection de domicile (y compris refus de renouvellement) indiqué par les organismes non visés par un agrément préfectoral
  // Q13B : Principal motif de refus d'élection de domicile (y compris refus de renouvellement) en 2018, indiqué par les organismes agréés à la domiciliation (cocher le motif principal)
  questions.Q_13.TOTAL = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "REFUS",
        },
      },
      logSql: false,
    }
  );
  
  questions.Q_13.HORS_AGREMENT = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "REFUS",
          motif: "HORS_AGREMENT",
        },
      },
      logSql: false,
    }
  );
  questions.Q_13.LIEN_COMMUNE = = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "REFUS",
          motif: "LIEN_COMMUNE",
        },
      },
      logSql: false,
    }
  );

  questions.Q_13.SATURATION = = await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "REFUS",
          motif: "SATURATION",
        },
      },
      logSql: false,
    }
  );

  questions.Q_13.AUTRE == await usagerHistoryStatsPeriodRepository.countDecisionsInPeriod(
    {
      structureId,
      countType: "domicilie",
      dateDebutPeriode: startDateUTC,
      dateFinPeriode: endDateUTC,
      criteria: {
        createdEvent: "new-decision",
        decision: {
          statut: "REFUS",
          motif: "AUTRE",
        },
      },
      logSql: false,
    }
  );

  questions.Q_20.appel = await statsQuestionsCoreBuilder.countInteractions({
    dateInteractionBefore: endDateUTC,
    dateInteractionAfter: startDateUTC,
    structureId,
    interactionType: "appel",
  });

  questions.Q_20.colisIn = await statsQuestionsCoreBuilder.countInteractions({
    dateInteractionBefore: endDateUTC,
    dateInteractionAfter: startDateUTC,
    structureId,
    interactionType: "colisIn",
  });

  questions.Q_20.colisOut = await statsQuestionsCoreBuilder.countInteractions({
    dateInteractionBefore: endDateUTC,
    dateInteractionAfter: startDateUTC,
    structureId,
    interactionType: "colisOut",
  });

  questions.Q_20.courrierIn = await statsQuestionsCoreBuilder.countInteractions(
    {
      dateInteractionBefore: endDateUTC,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "courrierIn",
    }
  );

  questions.Q_20.courrierOut = await statsQuestionsCoreBuilder.countInteractions(
    {
      dateInteractionBefore: endDateUTC,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "courrierOut",
    }
  );

  questions.Q_20.recommandeIn = await statsQuestionsCoreBuilder.countInteractions(
    {
      dateInteractionBefore: endDateUTC,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "recommandeIn",
    }
  );

  questions.Q_20.recommandeOut = await statsQuestionsCoreBuilder.countInteractions(
    {
      dateInteractionBefore: endDateUTC,
      dateInteractionAfter: startDateUTC,
      structureId,
      interactionType: "recommandeOut",
    }
  );

  questions.Q_20.visite = await statsQuestionsCoreBuilder.countInteractions({
    dateInteractionBefore: endDateUTC,
    dateInteractionAfter: startDateUTC,
    structureId,
    interactionType: "visite",
  });

  questions.Q_20.npai = await statsQuestionsCoreBuilder.countInteractions({
    dateInteractionBefore: endDateUTC,
    dateInteractionAfter: startDateUTC,
    structureId,
    interactionType: "npai",
  });

  return questions;
}
