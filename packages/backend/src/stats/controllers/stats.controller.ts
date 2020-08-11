import { Controller, Get, UseGuards, Body, Param, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as XLSX from "xlsx";
import { CurrentUser } from "../../auth/current-user.decorator";

import { InteractionsService } from "../../interactions/interactions.service";
import { StructuresService } from "../../structures/structures.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { User } from "../../users/user.interface";
import { StatsGeneratorService } from "../services/stats-generator.service";

import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { StatsDto } from "../dto/stats.dto";
import { StatsService } from "../services/stats.service";

import {
  motifsRadiation,
  motifsRefus,
  typeMenage,
  residence,
  cause,
  raison,
} from "../usagers.labels";

import moment = require("moment");

@Controller("stats")
export class StatsController {
  public sheet: {
    [key: string]: {};
  }[];

  public motifsRadiation: any;
  public typeMenage: any;
  public motifsRefus: any;
  public residence: any;
  public cause: any;

  constructor(
    private readonly statsGeneratorService: StatsGeneratorService,
    private readonly statsService: StatsService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {
    this.sheet = [];
    this.typeMenage = typeMenage;
    this.motifsRefus = motifsRefus;
    this.residence = residence;
    this.cause = cause;
    this.motifsRadiation = motifsRadiation;
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(FacteurGuard)
  @Get("today")
  public async today(@CurrentUser() user: User) {
    return this.statsService.getToday(user.structureId);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(FacteurGuard)
  @Get("id/:id")
  public async getStatById(@Param("id") id: string, @CurrentUser() user: User) {
    return this.statsService.getStatById(id, user.structureId);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(FacteurGuard)
  @Get("export/:id")
  public async export(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Res() res: any
  ) {
    const stats = await this.statsService.getStatById(id, user.structureId);
    this.sheet = [
      {
        A: "PARTIE 1 - TOTAL AU COURS DE L'ANNÉE",
        B: "",
      },
      {
        A: "Nombre d'attestations d'élection de domicile délivrées",
        B: stats.questions.Q_10,
      },
      {
        A:
          "Dont premières demandes conclues par une attestation d'élection de domicile",
        B: stats.questions.Q_10_A,
      },
      {
        A: "Dont renouvellements",
        B: stats.questions.Q_10_B,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Total radiations",
        B: stats.questions.Q_12.TOTAL,
      },
      {
        A: this.motifsRadiation.A_SA_DEMANDE,
        B: stats.questions.Q_12.A_SA_DEMANDE,
      },
      {
        A: this.motifsRadiation.PLUS_DE_LIEN_COMMUNE,
        B: stats.questions.Q_12.PLUS_DE_LIEN_COMMUNE,
      },
      {
        A: this.motifsRadiation.FIN_DE_DOMICILIATION,
        B: stats.questions.Q_12.FIN_DE_DOMICILIATION,
      },
      {
        A: this.motifsRadiation.NON_MANIFESTATION_3_MOIS,
        B: stats.questions.Q_12.NON_MANIFESTATION_3_MOIS,
      },

      {
        A: this.motifsRadiation.NON_RESPECT_REGLEMENT,
        B: stats.questions.Q_12.NON_RESPECT_REGLEMENT,
      },
      {
        A: this.motifsRadiation.ENTREE_LOGEMENT,
        B: stats.questions.Q_12.ENTREE_LOGEMENT,
      },

      {
        A: "",
        B: "",
      },
      {
        A: "Nombre de demandes refusées",
        B: stats.questions.Q_13.TOTAL,
      },
      {
        A: this.motifsRefus.HORS_AGREMENT,
        B: stats.questions.Q_13.HORS_AGREMENT,
      },
      {
        A: this.motifsRefus.LIEN_COMMUNE,
        B: stats.questions.Q_13.LIEN_COMMUNE,
      },
      {
        A: this.motifsRefus.SATURATION,
        B: stats.questions.Q_13.SATURATION,
      },
      {
        A: "Répartition des orientations",
        B: stats.questions.Q_14.CCAS,
      },
      {
        A: "Orientation vers Organisme agrée",
        B: stats.questions.Q_14.ASSO,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "PARTIE 2 - NOMBRE DE DOMICILIÉS PAR STATUT À CE JOUR",
        B: "",
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Total des domiciliés actifs + leurs ayants-droit",
        B: stats.questions.Q_11.VALIDE_TOTAL,
      },
      {
        A: "Nombre de domiciliés",
        B: stats.questions.Q_11.VALIDE,
      },
      {
        A: "Nombre d'ayants-droit",
        B: stats.questions.Q_11.VALIDE_AYANTS_DROIT,
      },

      {
        A: "",
        B: "",
      },
      {
        A: "Nombre de domiciliés actifs par tranche d'âge",
        B: "",
      },
      {
        A: "Majeurs",
        B: stats.questions.Q_18,
      },
      {
        A: "Mineurs",
        B: stats.questions.Q_17,
      },
      {
        A: "",
        B: "",
      },
      {
        A: " Nombre de domiciliés actifs par type de ménage",
        B: "",
      },
      {
        A: this.typeMenage.COUPLE_AVEC_ENFANT,
        B: stats.questions.Q_19.COUPLE_AVEC_ENFANT,
      },
      {
        A: this.typeMenage.COUPLE_SANS_ENFANT,
        B: stats.questions.Q_19.COUPLE_SANS_ENFANT,
      },
      {
        A: this.typeMenage.FEMME_ISOLE_AVEC_ENFANT,
        B: stats.questions.Q_19.FEMME_ISOLE_AVEC_ENFANT,
      },
      {
        A: this.typeMenage.FEMME_ISOLE_SANS_ENFANT,
        B: stats.questions.Q_19.FEMME_ISOLE_SANS_ENFANT,
      },
      {
        A: this.typeMenage.HOMME_ISOLE_AVEC_ENFANT,
        B: stats.questions.Q_19.HOMME_ISOLE_AVEC_ENFANT,
      },
      {
        A: this.typeMenage.HOMME_ISOLE_SANS_ENFANT,
        B: stats.questions.Q_19.HOMME_ISOLE_SANS_ENFANT,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Situation résidentielle",
        B: "",
      },

      {
        A: this.residence.DOMICILE_MOBILE,
        B: stats.questions.Q_22.DOMICILE_MOBILE,
      },
      {
        A: this.residence.HEBERGEMENT_SOCIAL,
        B: stats.questions.Q_22.HEBERGEMENT_SOCIAL,
      },
      {
        A: this.residence.HEBERGEMENT_TIERS,
        B: stats.questions.Q_22.HEBERGEMENT_TIERS,
      },
      {
        A: this.residence.HOTEL,
        B: stats.questions.Q_22.HOTEL,
      },
      {
        A: this.residence.SANS_ABRI,
        B: stats.questions.Q_22.SANS_ABRI,
      },
      {
        A: this.residence.AUTRE,
        B: stats.questions.Q_22.AUTRE,
      },
      {
        A: this.residence.NON_RENSEIGNE,
        B: stats.questions.Q_22.NON_RENSEIGNE,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Cause de l'instabilité de logement",
        B: "",
      },
      {
        A: this.cause.AUTRE,
        B: stats.questions.Q_21.AUTRE,
      },
      {
        A: this.cause.ERRANCE,
        B: stats.questions.Q_21.ERRANCE,
      },
      {
        A: this.cause.EXPULSION,
        B: stats.questions.Q_21.EXPULSION,
      },
      {
        A: this.cause.HEBERGE_SANS_ADRESSE,
        B: stats.questions.Q_21.HEBERGE_SANS_ADRESSE,
      },
      {
        A: this.cause.ITINERANT,
        B: stats.questions.Q_21.ITINERANT,
      },
      {
        A: this.cause.RUPTURE,
        B: stats.questions.Q_21.RUPTURE,
      },
      {
        A: this.cause.SORTIE_STRUCTURE,
        B: stats.questions.Q_21.SORTIE_STRUCTURE,
      },
      {
        A: this.cause.VIOLENCE,
        B: stats.questions.Q_21.VIOLENCE,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "PARTIE 3 : RÉSUMÉ DES INTERACTIONS SUR L'ANNÉE",
        B: "",
      },
      {
        A: "Appel téléphonique",
        B: stats.questions.Q_20.appel,
      },
      {
        A: "Colis enregistré",
        B: stats.questions.Q_20.colisIn,
      },
      {
        A: "Colis remis",
        B: stats.questions.Q_20.colisOut,
      },
      {
        A: "Courrier enregistré",
        B: stats.questions.Q_20.courrierIn,
      },
      {
        A: "Courrier remis",
        B: stats.questions.Q_20.courrierOut,
      },
      {
        A: "Avis de passage enregistré",
        B: stats.questions.Q_20.recommandeIn,
      },
      {
        A: "Avis de passage remis",
        B: stats.questions.Q_20.recommandeOut,
      },
      {
        A: "Passage enregistré",
        B: stats.questions.Q_20.visite,
      },
    ];

    const sheet1 = XLSX.utils.json_to_sheet(this.sheet, {
      skipHeader: true,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet1, "Statistiques");

    const buf = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });
    res.status(200).send(buf);
  }

  // Récupérer les stats disponibles
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(FacteurGuard)
  @Get("available")
  public async getAvailableStats(@CurrentUser() user: User) {
    return this.statsService.getAvailableStats(user.structureId);
  }

  @Get("force-regenerate")
  public async generate() {
    return this.statsGeneratorService.clean();
  }

  @Get("home-stats")
  public async home() {
    const statsHome = {
      structures: await this.statsGeneratorService.countStructures(),
      interactions: await this.statsGeneratorService.countInteractions(),
      usagers: await this.statsGeneratorService.countUsagers(),
    };
    return statsHome;
  }

  @UseGuards(FacteurGuard)
  @UseGuards(AuthGuard("jwt"))
  @Get("")
  public async getByDate(
    @CurrentUser() user: User,
    @Body() statsDto: StatsDto
  ) {
    // TODO: Filtrer la date
    // TODO: Créer la fonction de select de la date

    let start = statsDto.start || new Date();
    let end = statsDto.end || new Date();

    start = moment(start).utc().startOf("day").toDate();
    end = moment(end).utc().endOf("day").toDate();

    const query: {
      createdAt: {
        $lte: Date;
        $gte: Date;
      };
    } = {
      createdAt: {
        $lte: start,
        $gte: end,
      },
    };

    return this.statsService.getByDate(user.structureId, query);
  }
}
