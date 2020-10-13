import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Model, MongooseFilterQuery } from "mongoose";

import { Stats } from "../stats.class";
import { StatsDocument } from "../stats.interface";
import moment = require("moment");

@Injectable()
export class StatsService {
  public today: Date;

  constructor(
    @Inject("STATS_MODEL")
    private statsModel: Model<StatsDocument>
  ) {
    this.today = new Date();
  }

  public async getStatById(id: string, structureId: number): Promise<Stats> {
    const stats = await this.statsModel
      .findOne({ _id: id, structureId })
      .lean()
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("STAT_ID_INCORRECT", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  public async getToday(structureId: number): Promise<Stats> {
    const stats = await this.statsModel
      .find({ structureId })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("MY_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats[0];
  }

  public async getByDate(structureId: number, date: Date): Promise<Stats> {
    const stats = await this.statsModel
      .find({
        structureId,
        createdAt: {
          $gte: moment(date).utc().startOf("day").toDate(),
          $lte: moment(date).utc().endOf("day").toDate(),
        },
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("MY_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats[0];
  }

  public async getAvailableStats(structureId: number): Promise<Stats[]> {
    const stats = await this.statsModel
      .find({
        structureId,
      })
      .select("createdAt _id")
      .exec();

    if (!stats || stats === null) {
      throw new HttpException("ALL_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  private async getFirstStat(
    structureId: number,
    options?: {
      refDate?: Date;
      allowEmptyResult?: boolean;
    }
  ): Promise<Stats> {
    const conditions: MongooseFilterQuery<StatsDocument> = {
      structureId,
    };
    if (options?.refDate) {
      conditions.createdAt = {
        $gte: moment(options?.refDate).utc().startOf("day").toDate(),
      };
    }
    const stats = await this.statsModel
      .findOne(conditions)
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    if (!stats || stats === null) {
      if (options?.allowEmptyResult) {
        return undefined;
      }
      throw new HttpException("ALL_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  private async getLastStat(
    structureId: number,
    options?: {
      refDate?: Date;
      allowEmptyResult?: boolean;
    }
  ): Promise<Stats> {
    const conditions: MongooseFilterQuery<StatsDocument> = {
      structureId,
    };
    if (options?.refDate) {
      conditions.createdAt = {
        $lte: moment(options?.refDate).utc().endOf("day").toDate(),
      };
    }
    const stats = await this.statsModel
      .findOne(conditions)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!stats || stats === null) {
      if (options?.allowEmptyResult) {
        return undefined;
      }
      throw new HttpException("ALL_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  public async getStatsDiff({
    structureId,
    startDate,
    endDate,
  }: {
    structureId: number;
    startDate: Date;
    endDate?: Date;
  }): Promise<{
    stats: Stats;
    startDate?: Date;
    endDate?: Date;
  }> {
    const start = moment(startDate).add(1, "days").toDate();
    let startStats = await this.getLastStat(structureId, {
      refDate: start,
      allowEmptyResult: true,
    });
    if (!startStats) {
      // not stats found for start date: use first date
      Logger.warn(
        `[StatsService.getStats] no stats found for getLastStat(${structureId}, ${startDate.toISOString()})`
      );
      startStats = await this.getFirstStat(structureId, {
        allowEmptyResult: true,
      });
      if (!startStats) {
        Logger.error(
          `[StatsService.getStats] no stats found for getFirstStat(${structureId}})`
        );
        throw new HttpException("ALL_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
      }
    }

    if (endDate) {
      if (
        new Date(startStats.createdAt).getTime() > new Date(endDate).getTime()
      ) {
        // force endDate to be AFTER begin date
        endDate = startStats.createdAt;
      }
      const end = moment(endDate).add(1, "days").toDate();
      const endStats: Stats = await this.getLastStat(structureId, {
        refDate: end,
        allowEmptyResult: true,
      });
      const stats = this.buildStatsDiff(startStats, endStats);
      return {
        stats,
        startDate: moment(startStats.createdAt).add(-1, "days").toDate(),
        endDate: moment(endStats.createdAt).add(-1, "days").toDate(),
      };
    }
    return {
      stats: startStats,
      startDate: moment(startStats.createdAt).add(-1, "days").toDate(),
      endDate: undefined,
    };
  }

  private buildStatsDiff(A: Stats, B: Stats) {
    if (!B) {
      Logger.error(`[StatsService.buildStatsDiff] B is not defined`);
      return A;
    }
    if (!A) {
      Logger.error(`[StatsService.buildStatsDiff] A is not defined`);
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
