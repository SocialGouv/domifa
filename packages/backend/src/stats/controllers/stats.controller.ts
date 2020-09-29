import {
  Controller,
  Get,
  UseGuards,
  Body,
  Param,
  Res,
  Post,
} from "@nestjs/common";
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
} from "../usagers.labels";

import { Stats } from "../stats.class";
import moment = require("moment");
import { stat } from "fs";

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
    res.status(200).send(this.exportData(stats));
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
    const usagers = await this.statsGeneratorService.countUsagers();
    const ayantsDroits = await this.statsGeneratorService.countAyantsDroits();

    const statsHome = {
      structures: await this.statsGeneratorService.countStructures(),
      interactions: await this.statsGeneratorService.countInteractions(),
      usagers: usagers + ayantsDroits[0].count,
    };
    return statsHome;
  }

  @UseGuards(FacteurGuard)
  @UseGuards(AuthGuard("jwt"))
  @Post("")
  public async getByDate(
    @CurrentUser() user: User,
    @Body() statsDto: StatsDto
  ) {
    return this.parsePostData(user, statsDto);
  }

  @UseGuards(FacteurGuard)
  @UseGuards(AuthGuard("jwt"))
  @Post("export")
  public async exportByDate(
    @CurrentUser() user: User,
    @Body() statsDto: StatsDto,
    @Res() res: any
  ) {
    const dataToExport = await this.parsePostData(user, statsDto);
    res.status(200).send(this.exportData(dataToExport, statsDto));
  }

  private async parsePostData(user: User, statsDto: StatsDto): Promise<Stats> {
    let A: Stats = await this.statsService.getFirstStat(user.structureId);

    const start = moment(new Date(statsDto.start)).add(1, "days").toDate();

    // Vérification : on récupère le premier fichier de stat
    if (A.date < start) {
      A = await this.statsService.getByDate(user.structureId, start);
    }

    if (statsDto.end) {
      const end = moment(new Date(statsDto.end)).add(1, "days").toDate();
      const B: Stats = await this.statsService.getByDate(user.structureId, end);

      return this.compare(A, B);
    }
    return A;
  }

  private exportData(stats: Stats, statsDto?: StatsDto) {
    let start = moment(new Date(stats.date)).format("DD/MM/yyyy");
    let dateDatas = "  01/01/2020 au " + start;

    if (statsDto) {
      start = moment(new Date(statsDto.start)).format("DD/MM/yyyy");
      dateDatas = " du 01/01/2020 au " + start;

      if (statsDto.end) {
        const end = moment(new Date(statsDto.end)).format("DD/MM/yyyy");
        dateDatas = " du " + start + " au " + end;
        start = moment(new Date(statsDto.end)).format("DD/MM/yyyy");
      }
    }

    this.sheet = [
      {
        A: "1. DOMICILIÉS PAR STATUT AU " + start,
        B: "",
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Total des domiciliés actifs + leurs ayants-droits",
        B: stats.questions.Q_11.VALIDE_TOTAL,
      },
      {
        A: "Nombre de domiciliés",
        B: stats.questions.Q_11.VALIDE,
      },
      {
        A: "Nombre d'ayants-droits",
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
        A: "2. Activité " + dateDatas,
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
        A: this.motifsRadiation.ENTREE_LOGEMENT,
        B: stats.questions.Q_12.AUTRE,
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
        A: "Autre motif",
        B: stats.questions.Q_13.AUTRE,
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
        A: "3. Total des interactions" + dateDatas,
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

    return buf;
  }

  private compare(A: Stats, B: Stats) {
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
