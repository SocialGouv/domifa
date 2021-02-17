import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { Model } from "mongoose";
import { LessThanOrEqual, Repository } from "typeorm";
import { domifaConfig } from "../../config";
import {
  appTypeormManager,
  InteractionsTable,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  StructureStatsTable,
} from "../../database";
import { StructuresService } from "../../structures/services/structures.service";
import { Structure } from "../../structures/structure-interface";
import { Usager } from "../../usagers/interfaces/usagers";
import { appLogger } from "../../util";
import { StructurePublic, StructureStats } from "../../_common/model";
import { InteractionType } from "../../_common/model/interaction";

const MAX_ERRORS = 10;
@Injectable()
export class StatsGeneratorService {
  private structureStatsRepository: Repository<StructureStatsTable>;
  private interactionRepository: Repository<InteractionsTable>;

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    private structureService: StructuresService
  ) {
    this.structureStatsRepository = appTypeormManager.getRepository(
      StructureStatsTable
    );
    this.interactionRepository = appTypeormManager.getRepository(
      InteractionsTable
    );
  }

  @Cron(domifaConfig().cron.stats.crontime)
  protected async generateStatsCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    await this.generateStats("cron");
  }

  public async generateStats(trigger: MonitoringBatchProcessTrigger) {
    appLogger.debug(
      "[StatsGeneratorService] START statistics generation : " + new Date()
    );

    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "generate-structures-stats",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const statsDay = setFixStatsDateTime(
          moment.utc().subtract(1, "day").toDate()
        );
        const structures = await this._findStructuresToGenerateStats({
          statsDay,
        });
        appLogger.debug(
          `[StatsGeneratorService] ${structures.length} structures to process :`
        );
        monitorTotal(structures.length);

        for (const structure of structures) {
          try {
            await this.generateStructureStats(statsDay, structure, false);
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

  private async _findStructuresToGenerateStats({
    statsDay,
  }: {
    statsDay: Date;
  }) {
    statsDay = setFixStatsDateTimeMax(statsDay);

    const structures: Structure[] = await this.structureService.findManyBasic({
      $or: [
        {
          lastExport: {
            $lt: statsDay,
          },
        },
        {
          lastExport: {
            $exists: false,
          },
        },
        {
          lastExport: null,
        },
      ],
    });
    return structures;
  }

  public async generateStructureStats(
    statsDay: Date,
    structure: StructurePublic,
    generated: boolean
  ): Promise<any> {
    const stat = await this.buildStats({
      statsDay,
      structure,
      generated,
    });

    const dateExport = setFixStatsDateTime(statsDay);

    const retourStructure = await this.structureService.updateLastExport(
      structure.id,
      dateExport
    );

    const retourStats = await this.structureStatsRepository.insert(stat);

    const updateStructureStats = await this.structureService.updateStructureStats(
      structure.id,
      stat.questions.Q_11.VALIDE,
      stat.questions.Q_11.REFUS,
      stat.questions.Q_11.RADIE
    );
    return { retourStructure, retourStats, updateStructureStats };
  }

  public async generateStructureStatsForPast({
    statsDay,
    structure,
  }: {
    statsDay: Date;
    structure: StructurePublic;
  }): Promise<StructureStats> {
    const stat = await this.buildStats({
      statsDay,
      structure,
      generated: true,
    });
    await this.structureStatsRepository.insert(stat);
    return stat;
  }

  private async totalDomiciliationsActives(
    statsDayEnd: Date,
    structureId: number,
    typeDemande: "PREMIERE" | "RENOUVELLEMENT" | "TOUS"
  ): Promise<number> {
    let typeDom: string | {} = typeDemande;

    if (typeDemande === "TOUS") {
      typeDom = {
        $in: ["PREMIERE", "RENOUVELLEMENT"],
      };
    }

    const response = await this.usagerModel
      .countDocuments({
        $or: [
          // CAS 1 : demande valide maintenant
          {
            "decision.dateDebut": {
              $lte: statsDayEnd,
            },
            "decision.statut": "VALIDE",
          },
          // CAS 2 : renouvellement en cours : demande Valide dernièrement mais instruction
          {
            "decision.statut": "INSTRUCTION",
            "historique.0.statut": "VALIDE",
            "historique.0.dateDebut": { $lte: statsDayEnd },
          },
          // CAS 3 : renouvellement en cours : demande Valide dernièrement mais en attente de décision
          {
            "decision.statut": "ATTENTE_DECISION",
            "historique.1.statut": "VALIDE",
            "historique.1.dateDebut": { $lte: statsDayEnd },
          },
        ],
        structureId,
        typeDom,
      })
      .exec();

    return !response || response === null ? 0 : response;
  }

  public async totalParStatutActifs(
    statsDayEnd: Date,
    structureId: number,
    statut?: string,
    motif?: string,
    orientation?: string,
    entretien?: { key: string; value: string },
    age?: string
  ): Promise<number> {
    const query: {
      "decision.dateDecision"?: {
        $lte: Date;
      };
      "decision.motif"?: string;
      "decision.statut"?: string | {};
      "decision.orientation"?: string;
      "entretien.residence"?: string | {};
      "entretien.cause"?: string | {};
      "entretien.typeMenage"?: string | {};
      dateNaissance?: {
        $gte?: Date;
        $lte?: Date;
      };
      structureId: number;
      typeDom?: string;
    } = {
      "decision.dateDecision": {
        $lte: statsDayEnd,
      },
      "decision.motif": motif,
      "decision.statut": statut,
      "decision.orientation": orientation,
      structureId,
    };

    if (!motif || motif === "") {
      delete query["decision.motif"];
    }

    if (!statut || statut === "") {
      delete query["decision.statut"];
    }

    if (statut && statut === "RENOUVELLEMENT") {
      query["decision.statut"] = {
        $in: ["INSTRUCTION", "ATTENTE_DECISION"],
      };
      query.typeDom = "RENOUVELLEMENT";
    }

    if (statut !== "REFUS" || !orientation || orientation === "") {
      delete query["decision.orientation"];
    }

    if (entretien && entretien.key !== "") {
      if (entretien.key === "cause") {
        query["entretien.cause"] = entretien.value;
        if (entretien.key === "cause" && entretien.value === "NON_RENSEIGNE") {
          query["entretien.cause"] = { $in: [null, ""] };
        }
      } else if (entretien.key === "typeMenage") {
        query["entretien.typeMenage"] = entretien.value;
        if (
          entretien.key === "typeMenage" &&
          entretien.value === "NON_RENSEIGNE"
        ) {
          query["entretien.typeMenage"] = { $in: [null, ""] };
        }
      } else if (entretien.key === "residence") {
        query["entretien.residence"] = entretien.value;
        if (
          entretien.key === "residence" &&
          entretien.value === "NON_RENSEIGNE"
        ) {
          query["entretien.residence"] = { $in: [null, ""] };
        }
      }
    }

    if (age) {
      const dateMajorite = moment
        .utc()
        .subtract(18, "year")
        .endOf("day")
        .toDate();

      query.dateNaissance = {
        $gte: dateMajorite,
        $lte: dateMajorite,
      };
      age === "majeurs"
        ? delete query.dateNaissance.$gte
        : delete query.dateNaissance.$lte;
    }

    const response = await this.usagerModel.countDocuments(query).exec();
    return !response || response === null ? 0 : response;
  }

  private async totalAyantsDroitsDesDomiciliesActifs(
    statsDayEnd: Date,
    structureId: number
  ): Promise<number> {
    const response = await this.usagerModel
      .aggregate([
        {
          $match: {
            $or: [
              // CAS 1 : demande valide maintenant
              {
                "decision.dateDebut": {
                  $lte: statsDayEnd,
                },
                "decision.statut": "VALIDE",
              },
              // CAS 2 : renouvellement en cours : demande Valide dernièrement mais instruction
              {
                "decision.statut": "INSTRUCTION",
                "historique.0.statut": "VALIDE",
                "historique.0.dateDebut": { $lte: statsDayEnd },
              },
              // CAS 3 : renouvellement en cours : demande Valide dernièrement mais en attente de décision
              {
                "decision.statut": "ATTENTE_DECISION",
                "historique.1.statut": "VALIDE",
                "historique.1.dateDebut": { $lte: statsDayEnd },
              },
            ],
            structureId,
          },
        },
        {
          $group: {
            _id: "$structureId",
            total: { $sum: { $size: "$ayantsDroits" } },
          },
        },
      ])
      .exec();
    if (!response || response === null || response.length === 0) {
      return 0;
    }
    return response[0].total;
  }

  // Recherche uniquement dans l'historique
  private async totalParStatutDansLeTemps(
    statsDayEnd: Date,
    structureId: number,
    statut: string,
    motif?: string,
    orientation?: string
  ): Promise<number> {
    const firstCondition = {
      "decision.dateDebut": {
        $lte: statsDayEnd,
      },
      "decision.dateDecision": {
        $lte: statsDayEnd,
      },
      "decision.motif": motif,
      "decision.statut": statut,
      "decision.orientation": orientation,
    };

    const secondCondition = {
      historique: {
        $elemMatch: {
          dateDecision: {
            $lte: statsDayEnd,
          },
          dateDebut: {
            $lte: statsDayEnd,
          },
          motif,
          statut,
          orientation,
        },
      },
    };

    /* ---- FIX EXPLICATION --- */
    /* Au départ, les dates de début enregistrées pour les refus et radié n'étaient pas les bonnes */
    /* On prend en compte la date de décision, qui elle correspond bien */
    if (statut === "REFUS" || statut === "RADIE") {
      delete secondCondition.historique.$elemMatch.dateDebut;
      delete firstCondition["decision.dateDebut"];
    } else {
      delete secondCondition.historique.$elemMatch.dateDecision;
      delete firstCondition["decision.dateDecision"];
    }

    if (!motif || motif === "") {
      delete firstCondition["decision.motif"];
      delete secondCondition.historique.$elemMatch.motif;
    }

    if (statut !== "REFUS" || !orientation || orientation === "") {
      delete firstCondition["decision.orientation"];
      delete secondCondition.historique.$elemMatch.orientation;
    }

    const query = {
      $or: [firstCondition, secondCondition],
      structureId,
    };

    const response = await this.usagerModel.countDocuments(query).exec();

    return !response || response === null ? 0 : response;
  }

  public async totalInteraction(
    statsDayEnd: Date,
    structureId: number,
    interactionType: InteractionType
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      //
      return this.interactionRepository.count({
        structureId,
        type: interactionType,
        dateInteraction: LessThanOrEqual(statsDayEnd),
      });
    } else {
      //
      const search = await this.interactionRepository
        .createQueryBuilder("interactions")
        .select("SUM(interactions.nbCourrier)", "sum")
        .where({
          structureId,
          type: interactionType,
          dateInteraction: LessThanOrEqual(statsDayEnd),
        })
        .groupBy("interactions.type")
        .getRawOne();
      return search?.sum ? parseInt(search?.sum, 10) : 0;
    }
  }

  public async countStructures(): Promise<number> {
    return this.structureModel.countDocuments({}).exec();
  }

  public async countUsagers(): Promise<number> {
    return this.usagerModel.countDocuments({}).exec();
  }

  public async countAyantsDroits(): Promise<any> {
    return this.usagerModel.aggregate([
      { $project: { totalAd: { $size: "$ayantsDroits" } } },
      { $group: { _id: null, count: { $sum: "$totalAd" } } },
    ]);
  }

  public async countDocs(): Promise<any> {
    return this.usagerModel.aggregate([
      { $project: { totalFichiers: { $size: "$docs" } } },
      { $group: { _id: null, count: { $sum: "$totalFichiers" } } },
    ]);
  }

  private async buildStats({
    statsDay,
    structure,
    generated,
  }: {
    statsDay: Date;
    structure: StructurePublic;
    generated: boolean;
  }) {
    // 11:11 par défaut pour faciliter les requêtes
    const dateExport = setFixStatsDateTime(statsDay);

    // End of stat day
    const statsDayEnd = moment
      .utc(statsDay)
      .endOf("day")
      .subtract(1, "minute")
      .toDate();

    if (statsDayEnd > new Date()) {
      throw new Error(`Invalid stats day ${statsDayEnd}`);
    }

    const stat = new StructureStatsTable({
      date: dateExport,
      questions: {
        Q_10: 0,
        Q_10_A: 0,
        Q_10_B: 0,
        Q_11: {
          REFUS: 0,
          RADIE: 0,
          VALIDE: 0,
          VALIDE_AYANTS_DROIT: 0,
          VALIDE_TOTAL: 0,
        },
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
        Q_14: {
          ASSO: 0,
          CCAS: 0,
        },
        Q_17: 0,
        Q_18: 0,
        Q_19: {
          COUPLE_AVEC_ENFANT: 0,
          COUPLE_SANS_ENFANT: 0,
          FEMME_ISOLE_AVEC_ENFANT: 0,
          FEMME_ISOLE_SANS_ENFANT: 0,
          HOMME_ISOLE_AVEC_ENFANT: 0,
          HOMME_ISOLE_SANS_ENFANT: 0,
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
      },
    });

    stat.capacite = structure.capacite;
    stat.structureId = structure.id;
    stat.nom = structure.nom;
    stat.structureType = structure.structureType;
    stat.ville = structure.ville;
    stat.codePostal = structure.codePostal;
    stat.departement = structure.departement;
    stat.generated = generated;

    //
    // Q10 : Nombre attestations delivrés depuis le début à Maintenant
    //
    // Statut actuel + Statut dans l'historique
    stat.questions.Q_10 = await this.totalDomiciliationsActives(
      statsDayEnd,
      structure.id,
      "TOUS"
    );

    // Dont Premiere demande
    stat.questions.Q_10_A = await this.totalDomiciliationsActives(
      statsDayEnd,
      structure.id,
      "PREMIERE"
    );

    // Dont renouvellement
    stat.questions.Q_10_B = await this.totalDomiciliationsActives(
      statsDayEnd,
      structure.id,
      "RENOUVELLEMENT"
    );

    //
    // Q 11 : nombres de dossiers par Statut maintenant, peu importe le statut
    //
    // Statut actuel uniquement
    //
    // VALIDE : domiciliés actifs
    // VALIDE_AYANTS_DROIT : Nombre d'ayant-droit des domiciliés actifs
    // RADIE : domiciliés radiés
    // REFUS : domiciliés actifs
    //
    stat.questions.Q_11.VALIDE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE"
    );

    stat.questions.Q_11.VALIDE_AYANTS_DROIT = await this.totalAyantsDroitsDesDomiciliesActifs(
      statsDayEnd,
      structure.id
    );

    stat.questions.Q_11.VALIDE_TOTAL =
      stat.questions.Q_11.VALIDE_AYANTS_DROIT + stat.questions.Q_11.VALIDE;

    stat.questions.Q_11.REFUS = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "REFUS"
    );

    stat.questions.Q_11.RADIE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "RADIE"
    );

    //
    // Q12 : Radiation effectués par Motif
    //
    // Regle de calcul : Statut actuel + Statut dans l'historique
    //
    stat.questions.Q_12.TOTAL = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE"
    );

    stat.questions.Q_12.A_SA_DEMANDE = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "A_SA_DEMANDE"
    );

    stat.questions.Q_12.AUTRE = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "AUTRE"
    );

    stat.questions.Q_12.ENTREE_LOGEMENT = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "ENTREE_LOGEMENT"
    );

    stat.questions.Q_12.FIN_DE_DOMICILIATION = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "FIN_DE_DOMICILIATION"
    );

    stat.questions.Q_12.NON_MANIFESTATION_3_MOIS = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "NON_MANIFESTATION_3_MOIS"
    );

    stat.questions.Q_12.NON_RESPECT_REGLEMENT = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "NON_RESPECT_REGLEMENT"
    );

    stat.questions.Q_12.PLUS_DE_LIEN_COMMUNE = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "RADIE",
      "PLUS_DE_LIEN_COMMUNE"
    );

    //
    // Q13 : Refus effectués par Motif
    //
    // Regle de calcul : Statut actuel + Statut dans l'historique
    //
    stat.questions.Q_13.TOTAL = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS"
    );

    stat.questions.Q_13.HORS_AGREMENT = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS",
      "HORS_AGREMENT"
    );

    stat.questions.Q_13.LIEN_COMMUNE = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS",
      "LIEN_COMMUNE"
    );

    stat.questions.Q_13.SATURATION = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS",
      "SATURATION"
    );

    stat.questions.Q_13.AUTRE = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS",
      "AUTRE"
    );

    stat.questions.Q_14.ASSO = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS",
      "",
      "asso"
    );

    stat.questions.Q_14.CCAS = await this.totalParStatutDansLeTemps(
      statsDayEnd,
      structure.id,
      "REFUS",
      "",
      "ccas"
    );

    stat.questions.Q_17 = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "", value: "" },
      "mineurs"
    );

    stat.questions.Q_18 = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "", value: "" },
      "majeurs"
    );

    stat.questions.Q_19.COUPLE_AVEC_ENFANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "typeMenage", value: "COUPLE_AVEC_ENFANT" }
    );

    stat.questions.Q_19.COUPLE_SANS_ENFANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "typeMenage", value: "COUPLE_SANS_ENFANT" }
    );

    stat.questions.Q_19.FEMME_ISOLE_AVEC_ENFANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "typeMenage", value: "FEMME_ISOLE_AVEC_ENFANT" }
    );

    stat.questions.Q_19.FEMME_ISOLE_SANS_ENFANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",

      { key: "typeMenage", value: "FEMME_ISOLE_SANS_ENFANT" }
    );

    stat.questions.Q_19.HOMME_ISOLE_AVEC_ENFANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",

      { key: "typeMenage", value: "HOMME_ISOLE_AVEC_ENFANT" }
    );

    stat.questions.Q_19.HOMME_ISOLE_SANS_ENFANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",

      { key: "typeMenage", value: "HOMME_ISOLE_SANS_ENFANT" }
    );

    stat.questions.Q_20.appel = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "appel"
    );

    stat.questions.Q_20.colisIn = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "colisIn"
    );

    stat.questions.Q_20.colisOut = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "colisOut"
    );

    stat.questions.Q_20.courrierIn = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "courrierIn"
    );

    stat.questions.Q_20.courrierOut = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "courrierOut"
    );

    stat.questions.Q_20.recommandeIn = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "recommandeIn"
    );

    stat.questions.Q_20.recommandeOut = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "recommandeOut"
    );

    stat.questions.Q_20.visite = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "visite"
    );

    stat.questions.Q_20.npai = await this.totalInteraction(
      statsDayEnd,
      structure.id,
      "npai"
    );

    stat.questions.Q_21.ERRANCE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "ERRANCE" }
    );

    stat.questions.Q_21.EXPULSION = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "EXPULSION" }
    );

    stat.questions.Q_21.HEBERGE_SANS_ADRESSE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "HEBERGE_SANS_ADRESSE" }
    );

    stat.questions.Q_21.ITINERANT = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "ITINERANT" }
    );

    stat.questions.Q_21.SORTIE_STRUCTURE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "SORTIE_STRUCTURE" }
    );

    stat.questions.Q_21.VIOLENCE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "VIOLENCE" }
    );

    stat.questions.Q_21.NON_RENSEIGNE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "NON_RENSEIGNE" }
    );

    stat.questions.Q_21.AUTRE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "AUTRE" }
    );

    stat.questions.Q_21.RUPTURE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "RUPTURE" }
    );

    stat.questions.Q_22.AUTRE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "AUTRE" }
    );
    stat.questions.Q_22.DOMICILE_MOBILE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "DOMICILE_MOBILE" }
    );

    stat.questions.Q_22.HEBERGEMENT_SOCIAL = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "HEBERGEMENT_SOCIAL" }
    );

    stat.questions.Q_22.HEBERGEMENT_TIERS = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "HEBERGEMENT_TIERS" }
    );

    stat.questions.Q_22.HOTEL = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "HOTEL" }
    );

    stat.questions.Q_22.SANS_ABRI = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "SANS_ABRI" }
    );

    stat.questions.Q_22.NON_RENSEIGNE = await this.totalParStatutActifs(
      statsDayEnd,
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "NON_RENSEIGNE" }
    );
    return stat;
  }
}
export function setFixStatsDateTime(statsDay: Date) {
  // 11:11 par défaut pour faciliter les requêtes
  return moment(statsDay)
    .set("hour", 11)
    .set("minute", 11)
    .endOf("hour")
    .toDate();
}

export function setFixStatsDateTimeMax(statsDay: Date) {
  // sécurité pour être sûr d'éviter tout problème de timezone dans le check de l'existence de la stat (temporaire car mongo)
  return moment(statsDay)
    .set("hour", 11 - 3)
    .set("minute", 11)
    .endOf("hour")
    .toDate();
}
