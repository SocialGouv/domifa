import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
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
    const structure = await this.structureService.findOneBasic({
      $or: [
        {
          lastExport: {
            $lte: this.today.toDate()
          }
        },
        {
          lastExport: {
            $exists: false
          }
        },
        {
          lastExport: null
        }
      ]
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
    stat.codePostal = structure.codePostal;

    stat.questions.Q_10 = await this.getDomiciliations(structure.id, {
      $in: ["PREMIERE", "RENOUVELLEMENT"]
    });

    // TODO : Ajouter le nombre de domiciliés ayant été importé cette année avec un début de dom cette année

    stat.questions.Q_10_A = await this.getDomiciliations(
      structure.id,
      "PREMIERE"
    );

    stat.questions.Q_10_B = await this.getDomiciliations(
      structure.id,
      "RENOUVELLEMENT"
    );

    stat.questions.Q_11 = await this.totalParStatutMaintenant(
      structure.id,
      "VALIDE"
    );

    stat.questions.Q_12.TOTAL = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE"
    );

    stat.questions.Q_12.A_SA_DEMANDE = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE",
      "A_SA_DEMANDE"
    );
    stat.questions.Q_12.ENTREE_LOGEMENT = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE",
      "ENTREE_LOGEMENT"
    );

    stat.questions.Q_12.FIN_DE_DOMICILIATION = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE",
      "FIN_DE_DOMICILIATION"
    );

    stat.questions.Q_12.NON_MANIFESTATION_3_MOIS = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE",
      "NON_MANIFESTATION_3_MOIS"
    );

    stat.questions.Q_12.NON_RESPECT_REGLEMENT = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE",
      "NON_RESPECT_REGLEMENT"
    );

    stat.questions.Q_12.PLUS_DE_LIEN_COMMUNE = await this.totalParStatutCetteAnnee(
      structure.id,
      "RADIE",
      "PLUS_DE_LIEN_COMMUNE"
    );

    stat.questions.Q_13.TOTAL = await this.totalParStatutCetteAnnee(
      structure.id,
      "REFUS"
    );

    stat.questions.Q_13.HORS_AGREMENT = await this.totalParStatutCetteAnnee(
      structure.id,
      "REFUS",
      "HORS_AGREMENT"
    );

    stat.questions.Q_13.LIEN_COMMUNE = await this.totalParStatutCetteAnnee(
      structure.id,
      "REFUS",
      "LIEN_COMMUNE"
    );

    stat.questions.Q_13.SATURATION = await this.totalParStatutCetteAnnee(
      structure.id,
      "REFUS",
      "SATURATION"
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
          $lte: moment(this.today)
            .endOf("day")
            .toDate()
        },
        structureId
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
          $lte: moment(this.today)
            .endOf("day")
            .toDate()
        }
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
            "decision.dateDecision": {
              $gte: this.debutAnnee,
              $lte: this.finAnnee
            },
            "decision.statut": "VALIDE"
          },
          {
            historique: {
              $elemMatch: {
                dateDecision: { $gte: this.debutAnnee, $lte: this.finAnnee },
                statut: "VALIDE"
              }
            }
          }
        ],
        structureId,
        typeDom: typeDemande
      })
      .exec();

    if (!response || response === null) {
      return 0;
    }
    return response;
  }

  private async totalParStatutMaintenant(
    structureId: number,
    statut: string
  ): Promise<number> {
    const response = await this.usagerModel
      .countDocuments({
        "decision.statut": statut,
        structureId
      })
      .exec();

    if (!response || response === null) {
      return 0;
    }
    return response;
  }

  private async totalParStatutCetteAnnee(
    structureId: number,
    statut: string,
    motif?: string
  ): Promise<number> {
    const query = {
      "decision.dateDecision": {
        $gte: this.debutAnnee,
        $lte: this.finAnnee
      },
      "decision.motif": motif,
      "decision.statut": statut,
      structureId
    };

    if (!motif) {
      delete query["decision.motif"];
    }

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
        type
      })
      .exec();

    if (!response || response === null) {
      return 0;
    }
    return response;
  }
}
