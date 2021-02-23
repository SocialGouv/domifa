import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import {
  appTypeormManager,
  structureStatsRepository,
  StructureStatsTable,
} from "../../database";
import { appLogger } from "../../util";
import { StructureCommon, StructureStats } from "../../_common/model";
import {
  expectDateToHaveNoUtcHoursMinutes,
  StatsGeneratorService,
} from "./stats-generator.service";

import moment = require("moment");

@Injectable()
export class StatsService {
  private structureStatsRepository: Repository<StructureStatsTable>;

  constructor(private statsGeneratorService: StatsGeneratorService) {
    this.structureStatsRepository = appTypeormManager.getRepository(
      StructureStatsTable
    );
  }

  public async deleteAll(structureId: number): Promise<any> {
    return this.structureStatsRepository.delete({
      structureId,
    });
  }

  public async getStatsDiff({
    structure,
    startDateUTC,
    endDateUTC,
  }: {
    structure: StructureCommon;
    startDateUTC: Date;
    endDateUTC?: Date;
  }): Promise<{
    stats: StructureStats;
    startDate?: Date;
    endDate?: Date;
  }> {
    expectDateToHaveNoUtcHoursMinutes(startDateUTC);
    if (endDateUTC) {
      expectDateToHaveNoUtcHoursMinutes(endDateUTC);
    }

    let startStats: StructureStats = await structureStatsRepository.findByStructureIdAndDate(
      {
        structureId: structure.id,
        statsDateUTC: startDateUTC,
      }
    );

    if (!startStats || startStats === null) {
      // NOT EXIST: on les génère à la volée
      startStats = await this.statsGeneratorService.generateStructureStatsForPast(
        { statsDateUTC: startDateUTC, structure }
      );
    }
    if (new Date(startStats.date).getTime() > new Date(endDateUTC).getTime()) {
      // force endDate to be AFTER begin date
      endDateUTC = startStats.date;
    }

    // Si date du jour
    // const endDateDay = moment.utc(endDateUTC).format("YYYY-MM-DD");
    // const today = moment.utc().format("YYYY-MM-DD");

    // if (today === endDateDay) {
    //   // NOTE toub: pourquoi on fait ça ici?
    //   endDateUTC = moment.utc(endDateUTC).add(1, "day").toDate();
    // }

    let endStats: StructureStats = await structureStatsRepository.findByStructureIdAndDate(
      {
        structureId: structure.id,
        statsDateUTC: endDateUTC,
      }
    );

    if (!endStats || endStats === null) {
      // NOT EXIST: on les génère à la volée
      endStats = await this.statsGeneratorService.generateStructureStatsForPast(
        { statsDateUTC: endDateUTC, structure }
      );
    }

    const stats = this.buildStatsDiff(startStats, endStats);

    return {
      stats,
      startDate: startStats.date,
      endDate: endStats.date,
    };
  }

  private buildStatsDiff<T extends Pick<StructureStats, "questions">>(
    A: T,
    B: T
  ) {
    if (!B) {
      appLogger.error(`[StatsService.buildStatsDiff] B is not defined`);
      return A;
    }
    if (!A) {
      appLogger.error(`[StatsService.buildStatsDiff] A is not defined`);
      return B;
    }

    const questions = {
      Q_10: B.questions.Q_10 - A.questions.Q_10,

      Q_10_A: B.questions.Q_10_A - A.questions.Q_10_A,

      Q_10_B: B.questions.Q_10_B - A.questions.Q_10_B,

      Q_11: {
        REFUS: B.questions.Q_11.REFUS,
        RADIE: B.questions.Q_11.RADIE,
        VALIDE: B.questions.Q_11.VALIDE,
        VALIDE_TOTAL: B.questions.Q_11.VALIDE_TOTAL,
        VALIDE_AYANTS_DROIT: B.questions.Q_11.VALIDE_AYANTS_DROIT,
      },

      Q_12: {
        AUTRE: B.questions.Q_12.AUTRE - A.questions.Q_12.AUTRE,
        TOTAL: B.questions.Q_12.TOTAL - A.questions.Q_12.TOTAL,
        A_SA_DEMANDE:
          B.questions.Q_12.A_SA_DEMANDE - A.questions.Q_12.A_SA_DEMANDE,
        ENTREE_LOGEMENT:
          B.questions.Q_12.ENTREE_LOGEMENT - A.questions.Q_12.ENTREE_LOGEMENT,
        FIN_DE_DOMICILIATION:
          B.questions.Q_12.FIN_DE_DOMICILIATION -
          A.questions.Q_12.FIN_DE_DOMICILIATION,
        NON_MANIFESTATION_3_MOIS:
          B.questions.Q_12.NON_MANIFESTATION_3_MOIS -
          A.questions.Q_12.NON_MANIFESTATION_3_MOIS,
        NON_RESPECT_REGLEMENT:
          B.questions.Q_12.NON_RESPECT_REGLEMENT -
          A.questions.Q_12.NON_RESPECT_REGLEMENT,
        PLUS_DE_LIEN_COMMUNE:
          B.questions.Q_12.PLUS_DE_LIEN_COMMUNE -
          A.questions.Q_12.PLUS_DE_LIEN_COMMUNE,
      },

      Q_13: {
        TOTAL: B.questions.Q_13.TOTAL - A.questions.Q_13.TOTAL,
        AUTRE: B.questions.Q_13.AUTRE - A.questions.Q_13.AUTRE,
        HORS_AGREMENT:
          B.questions.Q_13.HORS_AGREMENT - A.questions.Q_13.HORS_AGREMENT,
        LIEN_COMMUNE:
          B.questions.Q_13.LIEN_COMMUNE - A.questions.Q_13.LIEN_COMMUNE,
        SATURATION: B.questions.Q_13.SATURATION - A.questions.Q_13.SATURATION,
      },

      Q_14: {
        CCAS: B.questions.Q_14.CCAS - A.questions.Q_14.CCAS,
        ASSO: B.questions.Q_14.ASSO - A.questions.Q_14.ASSO,
      },

      Q_17: B.questions.Q_17,
      Q_18: B.questions.Q_18,

      Q_19: {
        COUPLE_AVEC_ENFANT: B.questions.Q_19.COUPLE_AVEC_ENFANT,
        COUPLE_SANS_ENFANT: B.questions.Q_19.COUPLE_SANS_ENFANT,
        FEMME_ISOLE_AVEC_ENFANT: B.questions.Q_19.FEMME_ISOLE_AVEC_ENFANT,
        FEMME_ISOLE_SANS_ENFANT: B.questions.Q_19.FEMME_ISOLE_SANS_ENFANT,
        HOMME_ISOLE_AVEC_ENFANT: B.questions.Q_19.HOMME_ISOLE_AVEC_ENFANT,
        HOMME_ISOLE_SANS_ENFANT: B.questions.Q_19.HOMME_ISOLE_SANS_ENFANT,
      },

      /* NOMBRE D'INTERACTIONS GLOBALES */
      Q_20: {
        appel: B.questions.Q_20.appel - A.questions.Q_20.appel,
        colisIn: B.questions.Q_20.colisIn - A.questions.Q_20.colisIn,
        colisOut: B.questions.Q_20.colisOut - A.questions.Q_20.colisOut,
        courrierIn: B.questions.Q_20.courrierIn - A.questions.Q_20.courrierIn,
        npai: B.questions.Q_20.npai - A.questions.Q_20.npai,
        courrierOut:
          B.questions.Q_20.courrierOut - A.questions.Q_20.courrierOut,
        recommandeIn:
          B.questions.Q_20.recommandeIn - A.questions.Q_20.recommandeIn,
        recommandeOut:
          B.questions.Q_20.recommandeOut - A.questions.Q_20.recommandeOut,
        visite: B.questions.Q_20.visite - A.questions.Q_20.visite,
      },

      /* AUTRES QUESTIONS DE L'ENTRETIEN */
      Q_21: {
        AUTRE: B.questions.Q_21.AUTRE,
        ERRANCE: B.questions.Q_21.ERRANCE,
        EXPULSION: B.questions.Q_21.EXPULSION,
        HEBERGE_SANS_ADRESSE: B.questions.Q_21.HEBERGE_SANS_ADRESSE,
        ITINERANT: B.questions.Q_21.ITINERANT,
        RUPTURE: B.questions.Q_21.RUPTURE,
        SORTIE_STRUCTURE: B.questions.Q_21.SORTIE_STRUCTURE,
        VIOLENCE: B.questions.Q_21.VIOLENCE,
        NON_RENSEIGNE: B.questions.Q_21.NON_RENSEIGNE,
      },

      /* SITUATION RESIDENTIELLE */
      Q_22: {
        AUTRE: B.questions.Q_22.AUTRE,
        DOMICILE_MOBILE: B.questions.Q_22.DOMICILE_MOBILE,
        HEBERGEMENT_SOCIAL: B.questions.Q_22.HEBERGEMENT_SOCIAL,
        HEBERGEMENT_TIERS: B.questions.Q_22.HEBERGEMENT_TIERS,
        HOTEL: B.questions.Q_22.HOTEL,
        SANS_ABRI: B.questions.Q_22.SANS_ABRI,
        NON_RENSEIGNE: B.questions.Q_22.NON_RENSEIGNE,
      },
    };

    const C = A;

    C.questions = questions;

    return C;
  }
}
