import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { LessThanOrEqual, Repository } from "typeorm";
import { domifaConfig } from "../../config";
import {
  appTypeormManager,
  InteractionsTable,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  structureRepository,
  StructureStatsTable,
  usagerRepository,
} from "../../database";
import { StructuresService } from "../../structures/services/structures.service";
import { appLogger } from "../../util";
import {
  StructureCommon,
  StructureLight,
  StructureStats,
} from "../../_common/model";
import { InteractionType } from "../../_common/model/interaction";

@Injectable()
export class StatsGeneratorService {
  // Fin de journée de la stat recherché
  public endOfStatDate: Date;
  // Date à laquelle la majorité est franchie
  public dateMajorite: Date;

  private structureStatsRepository: Repository<StructureStatsTable>;
  private interactionRepository: Repository<InteractionsTable>;

  constructor(private structureService: StructuresService) {
    this.endOfStatDate = moment().utc().endOf("day").toDate();

    this.dateMajorite = moment().subtract(18, "year").endOf("day").toDate();

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
        const today = moment().utc().subtract(1, "day").endOf("day").toDate();
        const structures = await this._findStructuresToGenerateStats({ today });
        appLogger.debug(
          `[StatsGeneratorService] ${structures.length} structures to process :`
        );
        monitorTotal(structures.length);

        for (const structure of structures) {
          try {
            await this.generateStructureStats(today, structure, false);
            monitorSuccess();
          } catch (err) {
            const totalErrors = monitorError(err);
            if (totalErrors > 20) {
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
    today,
  }: {
    today: Date;
  }): Promise<StructureLight[]> {
    const structures: StructureLight[] = await this.structureService.findManyLight(
      {
        $or: [
          {
            lastExport: {
              $lte: today,
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
      }
    );
    return structures;
  }

  public async generateStructureStats(
    date: Date,
    structure: StructureLight,
    generated: boolean
  ) {
    const stat = await this.buildStats(structure, {
      date,
      generated,
    });

    const dateExport = moment()
      .utc()
      .startOf("day")
      .set("hour", 11)
      .set("minute", 11)
      .toDate();

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

  public async generateStructureStatsForPast(
    date: Date,
    structure: StructureCommon
  ): Promise<StructureStats> {
    const stat = await this.buildStats(structure, { date, generated: true });
    await this.structureStatsRepository.insert(stat);
    return stat;
  }

  public async totalInteraction(
    structureId: number,
    interactionType: InteractionType
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      //
      return this.interactionRepository.count({
        structureId,
        type: interactionType,
        dateInteraction: LessThanOrEqual(this.endOfStatDate),
      });
    } else {
      //
      const search = await this.interactionRepository
        .createQueryBuilder("interactions")
        .select("SUM(interactions.nbCourrier)", "sum")
        .where({
          structureId,
          type: interactionType,
          dateInteraction: LessThanOrEqual(this.endOfStatDate),
        })
        .groupBy("interactions.type")
        .getRawOne();
      return search?.sum ? parseInt(search?.sum, 10) : 0;
    }
  }

  public async countStructures(): Promise<number> {
    return structureRepository.count();
  }

  private async buildStats(
    structure: StructureLight,
    { date, generated }: { date: Date; generated: boolean }
  ) {
    const endOfDay = moment(date).endOf("day").subtract(1, "minute").toDate();

    this.dateMajorite = moment(date).subtract(18, "year").endOf("day").toDate();

    const stat = new StructureStatsTable({
      date: endOfDay,
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
    stat.questions.Q_10 = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      actifsInHistoryBefore: this.endOfStatDate,
    });

    // Dont Premiere demande
    stat.questions.Q_10_A = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      actifsInHistoryBefore: this.endOfStatDate,
      typeDom: "PREMIERE",
    });

    // Dont renouvellement
    stat.questions.Q_10_B = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      actifsInHistoryBefore: this.endOfStatDate,
      typeDom: "RENOUVELLEMENT",
    });

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
    stat.questions.Q_11.VALIDE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
    });

    stat.questions.Q_11.VALIDE_AYANTS_DROIT = await usagerRepository.countAyantsDroits(
      {
        structureId: structure.id,
        actifsInHistoryBefore: this.endOfStatDate,
      }
    );

    stat.questions.Q_11.VALIDE_TOTAL =
      stat.questions.Q_11.VALIDE_AYANTS_DROIT + stat.questions.Q_11.VALIDE;

    stat.questions.Q_11.REFUS = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "REFUS",
        dateDecisionBefore: this.endOfStatDate,
      },
    });

    stat.questions.Q_11.RADIE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "RADIE",
        dateDecisionBefore: this.endOfStatDate,
      },
    });

    //
    // Q12 : Radiation effectués par Motif
    //
    // Regle de calcul : Statut actuel + Statut dans l'historique
    //
    stat.questions.Q_12.TOTAL = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decisionInHistory: {
        statut: "RADIE",
        dateDecisionBefore: this.endOfStatDate,
      },
    });

    stat.questions.Q_12.A_SA_DEMANDE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "RADIE",
          dateDecisionBefore: this.endOfStatDate,
          motif: "A_SA_DEMANDE",
        },
      }
    );
    stat.questions.Q_12.AUTRE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decisionInHistory: {
        statut: "RADIE",
        dateDecisionBefore: this.endOfStatDate,
        motif: "AUTRE",
      },
    });

    stat.questions.Q_12.ENTREE_LOGEMENT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "RADIE",
          dateDecisionBefore: this.endOfStatDate,
          motif: "ENTREE_LOGEMENT",
        },
      }
    );

    stat.questions.Q_12.FIN_DE_DOMICILIATION = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "RADIE",
          dateDecisionBefore: this.endOfStatDate,
          motif: "FIN_DE_DOMICILIATION",
        },
      }
    );

    stat.questions.Q_12.NON_MANIFESTATION_3_MOIS = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "RADIE",
          dateDecisionBefore: this.endOfStatDate,
          motif: "NON_MANIFESTATION_3_MOIS",
        },
      }
    );

    stat.questions.Q_12.NON_RESPECT_REGLEMENT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "RADIE",
          dateDecisionBefore: this.endOfStatDate,
          motif: "NON_RESPECT_REGLEMENT",
        },
      }
    );

    stat.questions.Q_12.PLUS_DE_LIEN_COMMUNE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "RADIE",
          dateDecisionBefore: this.endOfStatDate,
          motif: "PLUS_DE_LIEN_COMMUNE",
        },
      }
    );

    //
    // Q13 : Refus effectués par Motif
    //
    // Regle de calcul : Statut actuel + Statut dans l'historique
    //
    stat.questions.Q_13.TOTAL = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decisionInHistory: {
        statut: "REFUS",
        dateDecisionBefore: this.endOfStatDate,
      },
    });

    stat.questions.Q_13.HORS_AGREMENT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "REFUS",
          dateDecisionBefore: this.endOfStatDate,
          motif: "HORS_AGREMENT",
        },
      }
    );
    stat.questions.Q_13.LIEN_COMMUNE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "REFUS",
          dateDecisionBefore: this.endOfStatDate,
          motif: "LIEN_COMMUNE",
        },
      }
    );

    stat.questions.Q_13.SATURATION = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decisionInHistory: {
          statut: "REFUS",
          dateDecisionBefore: this.endOfStatDate,
          motif: "SATURATION",
        },
      }
    );

    stat.questions.Q_13.AUTRE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decisionInHistory: {
        statut: "REFUS",
        dateDecisionBefore: this.endOfStatDate,
        motif: "AUTRE",
      },
    });

    stat.questions.Q_14.ASSO = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decisionInHistory: {
        statut: "REFUS",
        dateDecisionBefore: this.endOfStatDate,
        orientation: "asso",
      },
    });
    stat.questions.Q_14.CCAS = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decisionInHistory: {
        statut: "REFUS",
        dateDecisionBefore: this.endOfStatDate,
        orientation: "ccas",
      },
    });

    stat.questions.Q_17 = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      dateNaissance: {
        min: this.dateMajorite, // mineurs
      },
    });

    stat.questions.Q_18 = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      dateNaissance: {
        max: this.dateMajorite, // majeurs
      },
    });

    stat.questions.Q_19.COUPLE_AVEC_ENFANT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          typeMenage: "COUPLE_AVEC_ENFANT",
        },
      }
    );

    stat.questions.Q_19.COUPLE_SANS_ENFANT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          typeMenage: "COUPLE_SANS_ENFANT",
        },
      }
    );

    stat.questions.Q_19.FEMME_ISOLE_AVEC_ENFANT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
        },
      }
    );

    stat.questions.Q_19.FEMME_ISOLE_SANS_ENFANT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          typeMenage: "FEMME_ISOLE_SANS_ENFANT",
        },
      }
    );

    stat.questions.Q_19.HOMME_ISOLE_AVEC_ENFANT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          typeMenage: "HOMME_ISOLE_AVEC_ENFANT",
        },
      }
    );

    stat.questions.Q_19.HOMME_ISOLE_SANS_ENFANT = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          typeMenage: "HOMME_ISOLE_SANS_ENFANT",
        },
      }
    );

    stat.questions.Q_20.appel = await this.totalInteraction(
      structure.id,
      "appel"
    );

    stat.questions.Q_20.colisIn = await this.totalInteraction(
      structure.id,
      "colisIn"
    );

    stat.questions.Q_20.colisOut = await this.totalInteraction(
      structure.id,
      "colisOut"
    );

    stat.questions.Q_20.courrierIn = await this.totalInteraction(
      structure.id,
      "courrierIn"
    );

    stat.questions.Q_20.courrierOut = await this.totalInteraction(
      structure.id,
      "courrierOut"
    );

    stat.questions.Q_20.recommandeIn = await this.totalInteraction(
      structure.id,
      "recommandeIn"
    );

    stat.questions.Q_20.recommandeOut = await this.totalInteraction(
      structure.id,
      "recommandeOut"
    );

    stat.questions.Q_20.visite = await this.totalInteraction(
      structure.id,
      "visite"
    );

    stat.questions.Q_20.npai = await this.totalInteraction(
      structure.id,
      "npai"
    );

    stat.questions.Q_21.ERRANCE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        cause: "ERRANCE",
      },
    });

    stat.questions.Q_21.EXPULSION = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        cause: "EXPULSION",
      },
    });

    stat.questions.Q_21.HEBERGE_SANS_ADRESSE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          cause: "HEBERGE_SANS_ADRESSE",
        },
      }
    );

    stat.questions.Q_21.ITINERANT = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        cause: "ITINERANT",
      },
    });

    stat.questions.Q_21.SORTIE_STRUCTURE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          cause: "SORTIE_STRUCTURE",
        },
      }
    );

    stat.questions.Q_21.VIOLENCE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        cause: "VIOLENCE",
      },
    });

    stat.questions.Q_21.NON_RENSEIGNE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          cause: "NON_RENSEIGNE",
        },
      }
    );

    stat.questions.Q_21.AUTRE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        cause: "AUTRE",
      },
    });

    stat.questions.Q_21.RUPTURE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        cause: "RUPTURE",
      },
    });

    stat.questions.Q_22.AUTRE = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        residence: "AUTRE",
      },
    });
    stat.questions.Q_22.DOMICILE_MOBILE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          residence: "DOMICILE_MOBILE",
        },
      }
    );

    stat.questions.Q_22.HEBERGEMENT_SOCIAL = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          residence: "HEBERGEMENT_SOCIAL",
        },
      }
    );

    stat.questions.Q_22.HEBERGEMENT_TIERS = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          residence: "HEBERGEMENT_TIERS",
        },
      }
    );

    stat.questions.Q_22.HOTEL = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        residence: "HOTEL",
      },
    });

    stat.questions.Q_22.SANS_ABRI = await usagerRepository.countDomiciliations({
      structureId: structure.id,
      decision: {
        statut: "VALIDE",
        dateDecisionBefore: this.endOfStatDate,
      },
      entretien: {
        residence: "SANS_ABRI",
      },
    });

    stat.questions.Q_22.NON_RENSEIGNE = await usagerRepository.countDomiciliations(
      {
        structureId: structure.id,
        decision: {
          statut: "VALIDE",
          dateDecisionBefore: this.endOfStatDate,
        },
        entretien: {
          residence: "NON_RENSEIGNE",
        },
      }
    );
    return stat;
  }
}
