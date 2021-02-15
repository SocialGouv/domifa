import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import * as XLSX from "xlsx";

import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";

import { appLogger } from "../../util";
import { AppAuthUser, StructureStats } from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { StatsGeneratorService } from "../services/stats-generator.service";
import { StatsService } from "../services/stats.service";
import {
  cause,
  motifsRadiation,
  motifsRefus,
  residence,
  typeMenage,
} from "../usagers.labels";

import moment = require("moment");
import { DashboardService } from "../services/dashboard.service";

@Controller("stats")
@ApiTags("stats")
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
    private readonly dashboardService: DashboardService
  ) {
    this.sheet = [];
    this.typeMenage = typeMenage;
    this.motifsRefus = motifsRefus;
    this.residence = residence;
    this.cause = cause;
    this.motifsRadiation = motifsRadiation;
  }

  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  @ApiBearerAuth()
  @Get("id/:id")
  public async getStatById(
    @Param("id") id: string,
    @CurrentUser() user: AppAuthUser
  ) {
    return this.statsService.getStatById(id, user.structureId);
  }

  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  @ApiBearerAuth()
  @Get("export/:id")
  public async export(
    @Param("id") id: string,
    @CurrentUser() user: AppAuthUser,
    @Res() res: Response
  ) {
    const stats = await this.statsService.getStatById(id, user.structureId);
    res.status(200).send(this.exportData(stats));
  }

  @Get("home-stats")
  public async home() {
    const usagers = await this.statsGeneratorService.countUsagers();
    const ayantsDroits = await this.statsGeneratorService.countAyantsDroits();

    const totalUsagers =
      ayantsDroits.length === 0 ? usagers : usagers + ayantsDroits[0].count;

    const statsHome = {
      structures: await this.statsGeneratorService.countStructures(),
      interactions: await this.dashboardService.totalInteractions("courrierIn"),
      usagers: totalUsagers,
    };
    return statsHome;
  }

  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  @ApiBearerAuth()
  @Post("")
  public async getByDate(
    @CurrentUser() user: AppAuthUser,
    @Body() statsDto: StatsDto
  ) {
    return this.getStatsDiff(user, statsDto);
  }

  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  @Post("export")
  public async exportByDate(
    @CurrentUser() user: AppAuthUser,
    @Body() statsDto: StatsDto,
    @Res() res: Response
  ) {
    const { stats: dataToExport } = await this.getStatsDiff(user, statsDto);
    res.status(200).send(this.exportData(dataToExport, statsDto));
  }

  private async getStatsDiff(
    user: Pick<AppAuthUser, "structure">,
    statsDto: StatsDto
  ): Promise<{
    stats: StructureStats;
    startDate?: Date;
    endDate?: Date;
  }> {
    return this.statsService.getStatsDiff({
      structure: user.structure,
      startDate: statsDto.start ? new Date(statsDto.start) : undefined,
      endDate: statsDto.end ? new Date(statsDto.end) : undefined,
    });
  }

  private exportData(stats: StructureStats, statsDto?: StatsDto) {
    appLogger.debug(
      `[StatsController] exportData (${JSON.stringify(stats, undefined, 2)})`
    );

    let start = moment(stats.createdAt).format("DD/MM/yyyy");
    let dateDatas = "  01/01/2020 au " + start;

    if (statsDto) {
      start = moment(statsDto.start).format("DD/MM/yyyy");
      dateDatas = " du 01/01/2020 au " + start;

      if (statsDto.end) {
        const end = moment(statsDto.end).format("DD/MM/yyyy");
        dateDatas = " du " + start + " au " + end;
        start = moment(statsDto.end).format("DD/MM/yyyy");
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
}
