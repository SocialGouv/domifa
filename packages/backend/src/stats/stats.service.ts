import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Model } from "mongoose";
import { Structure } from "../structures/structure-interface";
import { User } from "../users/user.interface";

import { Cron, CronExpression } from "@nestjs/schedule";
import * as moment from "moment";
import { Interaction } from "../interactions/interactions.interface";
import { InteractionsService } from "../interactions/interactions.service";
import { StructuresService } from "../structures/structures.service";
import { Usager } from "../usagers/interfaces/usagers";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsersService } from "../users/services/users.service";
import { Stats } from "./stats.class";
import { StatsDocument } from "./stats.interface";

@Injectable()
export class StatsService {
  public annee: number;
  public debutAnnee: Date;
  public finAnnee: Date;
  public today = moment().startOf("day");
  public tomorrow = moment().endOf("day");

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("STATS_MODEL")
    private statsModel: Model<StatsDocument>,
    @Inject("USER_MODEL")
    private userModel: Model<User>,
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    @Inject("INTERACTION_MODEL")
    private interactionModel: Model<Interaction>,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {
    this.annee = new Date().getFullYear();
    this.debutAnnee = new Date("January 01, " + this.annee + " 00:01:00");
    this.finAnnee = new Date("December 31, " + this.annee + " 23:59:00");
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  public async handleCron() {
    const structure: Structure = await this.structureService.findOneBasic({
      $or: [
        {
          lastExport: {
            $lte: this.today.toDate(),
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
      Logger.log("Export déjà en place : " + new Date(), "debug");
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

    // TODO : Ajouter le nombre de domiciliés ayant été importé cette année avec un début de dom cette année

    // TODO : Comptabiliser les domiciliés + leurs ayants-droits

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

    stat.questions.Q_20.visite = await this.totalInteraction(
      structure.id,
      "visite"
    );

    stat.questions.Q_19.COUPLE_AVEC_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "COUPLE_AVEC_ENFANT"
    );

    stat.questions.Q_19.COUPLE_SANS_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "COUPLE_SANS_ENFANT"
    );

    stat.questions.Q_19.FEMME_ISOLE_AVEC_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "FEMME_ISOLE_AVEC_ENFANT"
    );

    stat.questions.Q_19.FEMME_ISOLE_SANS_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "FEMME_ISOLE_SANS_ENFANT"
    );

    stat.questions.Q_19.HOMME_ISOLE_AVEC_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "HOMME_ISOLE_AVEC_ENFANT"
    );

    stat.questions.Q_19.HOMME_ISOLE_SANS_ENFANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "HOMME_ISOLE_SANS_ENFANT"
    );

    stat.questions.Q_21.ERRANCE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "ERRANCE"
    );

    stat.questions.Q_21.EXPULSION = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "EXPULSION"
    );

    stat.questions.Q_21.HEBERGE_SANS_ADRESSE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "HEBERGE_SANS_ADRESSE"
    );

    stat.questions.Q_21.ITINERANT = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "ITINERANT"
    );

    stat.questions.Q_21.SORTIE_STRUCTURE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "SORTIE_STRUCTURE"
    );
    stat.questions.Q_21.VIOLENCE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      "VIOLENCE"
    );

    stat.questions.Q_21.NON_RENSEIGNE = await this.totalMaintenant(
      structure.id,
      "VALIDE",
      "",
      "",
      ""
    );

    const retourStructure = await this.structureService.updateLastExport(
      structure._id
    );

    const retourStats = await new this.statsModel(stat).save();
    if (retourStructure && retourStats) {
      this.handleCron();
    } else {
      throw new HttpException("BUG_STAT", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getToday(structureId: number): Promise<Stats> {
    const stats = await this.statsModel
      .findOne({
        date: {
          $gte: this.today.toDate(),
          $lte: moment(this.today).endOf("day").toDate(),
        },
        structureId,
      })
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  public async getAll(structureId: number): Promise<Stats[]> {
    const stats = await this.statsModel
      .find({
        date: {
          $gte: this.today.toDate(),
          $lte: moment(this.today).endOf("day").toDate(),
        },
      })
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
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
  private async totalMaintenant(
    structureId: number,
    statut: string,
    motif?: string,
    orientation?: string,
    cause?: string
  ): Promise<number> {
    const query = {
      "decision.motif": motif,
      "decision.statut": statut,
      "decision.orientation": orientation,
      "entretien.cause": cause,
      structureId,
    };

    if (!motif || motif === "") {
      delete query["decision.motif"];
    }

    if (statut !== "REFUS" || !orientation || orientation === "") {
      delete query["decision.orientation"];
    }

    if (!cause) {
      delete query["entretien.cause"];
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

  private async totalInteraction(
    structureId: number,
    type: string
  ): Promise<number> {
    const response = await this.interactionModel
      .countDocuments({
        structureId,
        type,
      })
      .exec();

    if (!response || response === null) {
      return 0;
    }
    return response;
  }

  public async clean() {
    return this.structureModel
      .updateMany({}, { $set: { lastExport: null } })
      .exec((retour: any) => {
        Logger.log("Nettoyage des date de dernier export  : ");
        Logger.log(JSON.stringify(retour));
        Logger.log("");

        this.statsModel
          .deleteMany({
            date: {
              $gte: this.today.toDate(),
              $lte: this.tomorrow.toDate(),
            },
          })
          .exec((retour2: any) => {
            Logger.log("- Suppression du dernier Export  ");
            Logger.log(JSON.stringify(retour2));
            Logger.log("");
            Logger.log("-- Appel du Cron dans 5 sec");
            Logger.log("");

            setTimeout(() => {
              Logger.log(" ---> DEMARRAGE du Cron");
              this.handleCron();
              return true;
            }, 5000);
          });
      });
  }
}
