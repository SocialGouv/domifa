import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import * as XLSX from "xlsx";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { structureRepository, usagerRepository } from "../../database";
import { appLogger } from "../../util";
import { AppAuthUser, StructureStatsFull } from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { DashboardService } from "../services/dashboard.service";
import { structureStatsInPeriodGenerator } from "../services/stats-generator";
import { statsQuestionsCoreBuilder } from "../services/stats-questions-builder";
import {
  cause,
  motifsRadiation,
  motifsRefus,
  residence,
  typeMenage,
} from "../usagers.labels";

import moment = require("moment");

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

  constructor(private readonly dashboardService: DashboardService) {
    this.sheet = [];
    this.typeMenage = typeMenage;
    this.motifsRefus = motifsRefus;
    this.residence = residence;
    this.cause = cause;
    this.motifsRadiation = motifsRadiation;
  }

  @Get("home-stats")
  public async home() {
    const usagers = await usagerRepository.count();
    const ayantsDroits = await usagerRepository.countAyantsDroits();

    const totalUsagers = usagers + ayantsDroits;

    const statsHome = {
      structures: await structureRepository.count(),
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
    return this.buildStatsInPeriod(user, statsDto);
  }

  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  @Post("export")
  public async exportByDate(
    @CurrentUser() user: AppAuthUser,
    @Body() statsDto: StatsDto,
    @Res() res: Response
  ) {
    const { stats: dataToExport } = await this.buildStatsInPeriod(
      user,
      statsDto
    );
    res.status(200).send(this.exportData(dataToExport, statsDto));
  }

  private async buildStatsInPeriod(
    user: Pick<AppAuthUser, "structure">,
    statsDto: StatsDto
  ): Promise<{
    stats: StructureStatsFull;
    startDate?: Date;
    endDate?: Date;
  }> {
    const startDateUTC = statsQuestionsCoreBuilder.buildStatsDateUTC({
      date: statsDto.start,
    });
    const endDateUTC = statsQuestionsCoreBuilder.buildStatsDateUTC({
      date: statsDto.end,
    });
    return structureStatsInPeriodGenerator.buildStatsInPeriod({
      structure: user.structure,
      startDateUTC,
      endDateUTC,
    });
  }

  private exportData(stats: StructureStatsFull, statsDto?: StatsDto) {
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
        A: "Nombre de domiciliés actifs par sexe",
        B: "",
      },
      {
        A: "Femme",
        B: stats.questions.USAGERS.SEXE.F,
      },
      {
        A: "Homme",
        B: stats.questions.USAGERS.SEXE.H,
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
        A: "Moins de 15 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_0_14,
      },
      {
        A: "15-19 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_15_19,
      },
      {
        A: "20-24 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_20_24,
      },
      {
        A: "25-29 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_25_29,
      },
      {
        A: "30-34 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_30_34,
      },
      {
        A: "35-39 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_35_39,
      },
      {
        A: "40-44 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_40_44,
      },
      {
        A: "45-49 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_45_49,
      },
      {
        A: "50-54 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_50_54,
      },
      {
        A: "55-59 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_55_59,
      },
      {
        A: "60-64 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_60_64,
      },
      {
        A: "65-69 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_65_69,
      },
      {
        A: "70-74 ans",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_70_74,
      },
      {
        A: "75 ans ou plus",
        B: stats.questions.USAGERS.TRANCHE_AGE.T_75_PLUS,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Nombre de domiciliés actifs par type de ménage",
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
        A: "Motif principal de demande de domiciliation",
      },
      {
        A: "Exercice des droits civils ou civiques",
        B: stats.questions.Q_21.RAISON_DEMANDE.EXERCICE_DROITS,
      },
      {
        A: "Accès aux prestations sociales",
        B: stats.questions.Q_21.RAISON_DEMANDE.PRESTATIONS_SOCIALES,
      },
      {
        A: "Autre raison",
        B: stats.questions.Q_21.RAISON_DEMANDE.AUTRE,
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
        A: "Nombre total d'attestations d'élection de domicile délivrées",
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
        A: "Nombre total de radiations",
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
        A:
          "Nombre total de refus d'élection de domicile (y compris refus de renouvellements)",
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
