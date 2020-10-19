import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Structure } from "../../structures/structure-interface";

import { Cron, CronExpression } from "@nestjs/schedule";
import * as moment from "moment";
import { Interaction } from "../../interactions/interactions.interface";

import { StructuresService } from "../../structures/services/structures.service";
import { Usager } from "../../usagers/interfaces/usagers";

import { Stats } from "../stats.class";
import { StatsDocument } from "../stats.interface";
import { appLogger } from "../../util";

@Injectable()
export class StatsGeneratorService {
  public debutAnnee: Date;
  public finAnnee: Date;
  public dateMajorite: Date;
  public today: Date;
  public demain: Date;

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("STATS_MODEL")
    private statsModel: Model<StatsDocument>,
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    @Inject("INTERACTION_MODEL")
    private interactionModel: Model<Interaction>,
    private readonly structureService: StructuresService
  ) {
    this.today = new Date();
    this.demain = new Date();
    this.debutAnnee = new Date();
    this.finAnnee = new Date();
    this.dateMajorite = new Date();
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async handleCron() {
    this.today = moment().utc().startOf("day").toDate();
    this.demain = moment().utc().endOf("day").toDate();
    this.debutAnnee = moment().utc().startOf("year").toDate();
    this.finAnnee = moment().utc().endOf("year").toDate();
    this.dateMajorite = moment()
      .utc()
      .subtract(18, "year")
      .endOf("day")
      .toDate();

    appLogger.debug("CRON : " + new Date(), "debug");
    const structure: Structure = await this.structureService.findOneBasic({
      $or: [
        {
          lastExport: {
            $lte: this.today,
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

    if (!structure || structure === null) {
      appLogger.debug("Export déjà en place : " + new Date(), "debug");
      return;
    }

    const stat = new Stats();
    stat.capacite = structure.capacite;
    stat.structureId = structure.id;
    stat.nom = structure.nom;
    stat.structureType = structure.structureType;
    stat.ville = structure.ville;
    stat.codePostal = structure.codePostal;

    stat.questions.Q_10 = await this.getDomiciliations(structure.id, {
      $in: ["PREMIERE", "RENOUVELLEMENT"],
    });

    stat.questions.Q_10_A = await this.getDomiciliations(
      structure.id,
      "PREMIERE"
    );

    stat.questions.Q_10_B = await this.getDomiciliations(
      structure.id,
      "RENOUVELLEMENT"
    );

    stat.questions.Q_11.VALIDE = await this.totalMaintenant(
      structure.id,
      "VALIDE"
    );

    stat.questions.Q_11.VALIDE_AYANTS_DROIT = await this.totalAyantsDroitsMaintenant(
      structure.id
    );

    stat.questions.Q_11.VALIDE_TOTAL =
      stat.questions.Q_11.VALIDE_AYANTS_DROIT + stat.questions.Q_11.VALIDE;

    stat.questions.Q_11.REFUS = await this.totalMaintenant(
      structure.id,
      "REFUS"
    );

    stat.questions.Q_11.RADIE = await this.totalMaintenant(
      structure.id,
      "RADIE"
    );

    stat.questions.Q_12.TOTAL = await this.totalAnnee(structure.id, "RADIE");

    stat.questions.Q_12.A_SA_DEMANDE = await this.totalAnnee(
      structure.id,
      "RADIE",
      "A_SA_DEMANDE"
    );

    stat.questions.Q_12.AUTRE = await this.totalAnnee(
      structure.id,
      "RADIE",
      "AUTRE"
    );

    stat.questions.Q_12.ENTREE_LOGEMENT = await this.totalAnnee(
      structure.id,
      "RADIE",
      "ENTREE_LOGEMENT"
    );

    stat.questions.Q_12.FIN_DE_DOMICILIATION = await this.totalAnnee(
      structure.id,
      "RADIE",
      "FIN_DE_DOMICILIATION"
    );

    stat.questions.Q_12.NON_MANIFESTATION_3_MOIS = await this.totalAnnee(
      structure.id,
      "RADIE",
      "NON_MANIFESTATION_3_MOIS"
    );

    stat.questions.Q_12.NON_RESPECT_REGLEMENT = await this.totalAnnee(
      structure.id,
      "RADIE",
      "NON_RESPECT_REGLEMENT"
    );

    stat.questions.Q_12.PLUS_DE_LIEN_COMMUNE = await this.totalAnnee(
      structure.id,
      "RADIE",
      "PLUS_DE_LIEN_COMMUNE"
    );

    stat.questions.Q_13.TOTAL = await this.totalAnnee(structure.id, "REFUS");

    stat.questions.Q_13.HORS_AGREMENT = await this.totalAnnee(
      structure.id,
      "REFUS",
      "HORS_AGREMENT"
    );

    stat.questions.Q_13.LIEN_COMMUNE = await this.totalAnnee(
      structure.id,
      "REFUS",
      "LIEN_COMMUNE"
    );

    stat.questions.Q_13.SATURATION = await this.totalAnnee(
      structure.id,
      "REFUS",
      "SATURATION"
    );

    stat.questions.Q_13.AUTRE = await this.totalAnnee(
      structure.id,
      "REFUS",
      "AUTRE"
    );

    stat.questions.Q_14.ASSO = await this.totalAnnee(
      structure.id,
      "REFUS",
      "",
      "asso"
    );

    stat.questions.Q_14.CCAS = await this.totalAnnee(
      structure.id,
      "REFUS",
      "",
      "ccas"
    );

    stat.questions.Q_17 = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "", value: "" },
      "mineurs"
    );

    stat.questions.Q_18 = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "", value: "" },
      "majeurs"
    );

    stat.questions.Q_19.COUPLE_AVEC_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "typeMenage", value: "COUPLE_AVEC_ENFANT" }
    );

    stat.questions.Q_19.COUPLE_SANS_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "typeMenage", value: "COUPLE_SANS_ENFANT" }
    );

    stat.questions.Q_19.FEMME_ISOLE_AVEC_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "typeMenage", value: "FEMME_ISOLE_AVEC_ENFANT" }
    );

    stat.questions.Q_19.FEMME_ISOLE_SANS_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",

      { key: "typeMenage", value: "FEMME_ISOLE_SANS_ENFANT" }
    );

    stat.questions.Q_19.HOMME_ISOLE_AVEC_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",

      { key: "typeMenage", value: "HOMME_ISOLE_AVEC_ENFANT" }
    );

    stat.questions.Q_19.HOMME_ISOLE_SANS_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",

      { key: "typeMenage", value: "HOMME_ISOLE_SANS_ENFANT" }
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

    stat.questions.Q_21.ERRANCE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "ERRANCE" }
    );

    stat.questions.Q_21.EXPULSION = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "EXPULSION" }
    );

    stat.questions.Q_21.HEBERGE_SANS_ADRESSE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "HEBERGE_SANS_ADRESSE" }
    );

    stat.questions.Q_21.ITINERANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "ITINERANT" }
    );

    stat.questions.Q_21.SORTIE_STRUCTURE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "SORTIE_STRUCTURE" }
    );

    stat.questions.Q_21.VIOLENCE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "VIOLENCE" }
    );

    stat.questions.Q_21.NON_RENSEIGNE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "NON_RENSEIGNE" }
    );

    stat.questions.Q_21.AUTRE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "AUTRE" }
    );

    stat.questions.Q_21.RUPTURE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "cause", value: "RUPTURE" }
    );

    stat.questions.Q_22.AUTRE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "AUTRE" }
    );
    stat.questions.Q_22.DOMICILE_MOBILE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "DOMICILE_MOBILE" }
    );

    stat.questions.Q_22.HEBERGEMENT_SOCIAL = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "HEBERGEMENT_SOCIAL" }
    );

    stat.questions.Q_22.HEBERGEMENT_TIERS = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "HEBERGEMENT_TIERS" }
    );

    stat.questions.Q_22.HOTEL = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "HOTEL" }
    );

    stat.questions.Q_22.SANS_ABRI = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "SANS_ABRI" }
    );

    stat.questions.Q_22.NON_RENSEIGNE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      { key: "residence", value: "NON_RENSEIGNE" }
    );

    const dateExport = moment()
      .utc()
      .startOf("day")
      .set("hour", 11)
      .set("minute", 11)
      .toDate();
    const retourStructure = await this.structureService.updateLastExport(
      structure._id,
      dateExport
    );

    const retourStats = await new this.statsModel(stat).save();

    const updateStructureStats = await this.structureService.updateStructureStats(
      structure._id,
      stat.questions.Q_11.VALIDE,
      stat.questions.Q_11.REFUS,
      stat.questions.Q_11.RADIE
    );

    if (
      retourStructure &&
      retourStructure !== null &&
      retourStats &&
      retourStats !== null &&
      updateStructureStats &&
      updateStructureStats !== null
    ) {
      this.handleCron();
    } else {
      throw new HttpException("BUG_STATS", HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

  public async getAvailableStats(structureId: number): Promise<Stats[]> {
    appLogger.debug("------------------- ");
    appLogger.debug(this.today.toDateString());
    appLogger.debug(this.demain.toDateString());
    appLogger.debug("------------------- ");
    const stats = await this.statsModel
      .find({
        date: {
          $gte: this.today,
          $lte: this.demain,
        },
      })
      .exec();

    if (!stats || stats === null) {
      throw new HttpException("ALL_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  private async getDomiciliations(
    structureId: number,
    typeDemande: any
  ): Promise<number> {
    const response = await this.usagerModel
      .countDocuments({
        $or: [
          {
            "decision.dateDebut": {
              $gte: this.debutAnnee,
              $lte: this.finAnnee,
            },
            "decision.statut": "VALIDE",
          },
          {
            historique: {
              $elemMatch: {
                dateDebut: { $gte: this.debutAnnee, $lte: this.finAnnee },
                statut: "VALIDE",
              },
            },
          },
        ],
        structureId,
        typeDom: typeDemande,
      })
      .exec();

    if (!response || response === null) {
      return 0;
    }
    return response;
  }

  public async totalMaintenant(
    structureId: number,
    statut?: string,
    motif?: string,
    orientation?: string,
    entretien?: { key: string; value: string },
    age?: string
  ): Promise<number> {
    const query: {
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
      query.dateNaissance = {
        $gte: this.dateMajorite,
        $lte: this.dateMajorite,
      };
      age === "majeurs"
        ? delete query.dateNaissance.$gte
        : delete query.dateNaissance.$lte;
    }

    const response = await this.usagerModel.countDocuments(query).exec();

    if (!response || response === null) {
      return 0;
    }
    return response;
  }
  private async totalAyantsDroitsMaintenant(
    structureId: number
  ): Promise<number> {
    const response = await this.usagerModel
      .aggregate([
        {
          $match: {
            "decision.statut": "VALIDE",
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

  private async totalAnnee(
    structureId: number,
    statut: string,
    motif?: string,
    orientation?: string
  ): Promise<number> {
    const firstCondition = {
      "decision.dateDebut": {
        $gte: this.debutAnnee,
        $lte: this.finAnnee,
      },
      "decision.dateDecision": {
        $gte: this.debutAnnee,
        $lte: this.finAnnee,
      },
      "decision.motif": motif,
      "decision.statut": statut,
      "decision.orientation": orientation,
    };

    const secondCondition = {
      historique: {
        $elemMatch: {
          dateDecision: {
            $gte: this.debutAnnee,
            $lte: this.finAnnee,
          },
          dateDebut: {
            $gte: this.debutAnnee,
            $lte: this.finAnnee,
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

    if (!response || response === null) {
      return 0;
    }
    return response;
  }

  public async totalInteraction(
    structureId: number,
    type: string
  ): Promise<number> {
    if (type === "appel" || type === "visite") {
      return this.interactionModel.countDocuments({
        structureId,
        type,
      });
    } else {
      const search = {
        $match: {
          structureId,
          type,
        },
      };

      const groupBy = { $group: { _id: null, total: { $sum: "$nbCourrier" } } };
      const response = await this.interactionModel
        .aggregate([search, groupBy])
        .exec();

      if (response.length) {
        return typeof response[0].total !== "undefined" ? response[0].total : 0;
      }
      return 0;
    }
  }

  public async clean() {
    return this.structureModel
      .updateMany({}, { $set: { lastExport: undefined } })
      .exec((retour: any) => {
        appLogger.debug("Nettoyage des date de dernier export  : ");
        appLogger.debug(JSON.stringify(retour));
        appLogger.debug("");

        this.statsModel
          .deleteMany({
            date: {
              $gte: this.today,
              $lte: this.demain,
            },
          })
          .exec((retour2: any) => {
            appLogger.debug("- Suppression du dernier Export  ");
            appLogger.debug(JSON.stringify(retour2));
            appLogger.debug("");
            appLogger.debug("-- Appel du Cron dans 5 sec");
            appLogger.debug("");

            setTimeout(() => {
              appLogger.debug(" ---> DEMARRAGE du Cron");
              this.handleCron();
              return true;
            }, 5000);
          });
      });
  }

  public async countStructures(): Promise<any> {
    return this.structureModel.countDocuments({}).exec();
  }

  public async countInteractions(): Promise<any> {
    return this.interactionModel.countDocuments({ type: "courrierIn" }).exec();
  }

  public async countUsagers(): Promise<any> {
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
}
