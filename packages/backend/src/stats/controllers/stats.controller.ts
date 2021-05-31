import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUser } from "../../auth/current-user.decorator";
import { isDomifaAdmin } from "../../auth/guards/domifa.guard";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { structureRepository, usagerRepository } from "../../database";
import { structureStatsExporter } from "../../excel/export-structure-stats";
import { expressResponseExcelRenderer } from "../../util";
import { AppAuthUser, StructureStatsFull } from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { structureStatsInPeriodGenerator } from "../services";
import { DashboardService } from "../services/dashboard.service";
import { statsQuestionsCoreBuilder } from "../services/statsQuestionsCoreBuilder.service";
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
    if (statsDto.structureId !== user.structureId && !isDomifaAdmin(user)) {
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }
    return this.buildStatsInPeriod({
      ...statsDto,
      structureId: statsDto.structureId,
    });
  }

  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  @Post("export")
  public async exportByDate(
    @CurrentUser() user: AppAuthUser,
    @Body() statsDto: StatsDto,
    @Res() res: Response
  ) {
    if (statsDto.structureId !== user.structureId && !isDomifaAdmin(user)) {
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }
    const stats = await this.buildStatsInPeriod({
      ...statsDto,
    });
    // appLogger.debug(
    //   `[StatsController] exportData (${JSON.stringify(stats, undefined, 2)})`
    // );

    const workbook = await structureStatsExporter.generateExcelDocument({
      exportDate: new Date(),
      stats,
    });
    const fileName = buildExportStructureStatsFileName({
      startDateUTC: stats.period.startDateUTC,
      endDateUTCExclusive: stats.period.endDateUTCExclusive,
      structureId: statsDto.structureId,
    });
    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });
  }

  private async buildStatsInPeriod({
    structureId,
    start,
    end,
  }: {
    structureId: number;
    start: string;
    end: string;
  }): Promise<StructureStatsFull> {
    const startDateUTC = statsQuestionsCoreBuilder.removeUTCHours(
      moment.utc(start).toDate()
    );
    const endDateUTCExclusive = statsQuestionsCoreBuilder.removeUTCHours(
      moment.utc(end).add(1, "day").toDate()
    );

    return structureStatsInPeriodGenerator.buildStatsInPeriod({
      structureId,
      startDateUTC,
      endDateUTCExclusive,
    });
  }
}
export function buildExportStructureStatsFileName({
  startDateUTC,
  endDateUTCExclusive,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTCExclusive: Date;
  structureId: number;
}) {
  return `${moment(startDateUTC).format("yyyy-MM-DD")}_${moment(
    endDateUTCExclusive
  ).format("yyyy-MM-DD")}_export-structure-${structureId}-stats.xlsx`;
}
