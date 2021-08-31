import { StructuresService } from "./../../structures/services/structures.service";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
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
import {
  AppAuthUser,
  PublicStats,
  StructureStatsFull,
} from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { structureStatsInPeriodGenerator } from "../services";
import { DashboardService } from "../services/dashboard.service";
import { statsQuestionsCoreBuilder } from "../services/statsQuestionsCoreBuilder.service";

import moment = require("moment");

@Controller("stats")
@ApiTags("stats")
export class StatsController {
  public sheet: {
    [key: string]: {};
  }[];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly structuresService: StructuresService
  ) {
    this.sheet = [];
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

  @Get("public-stats/:regionId?")
  public async getPublicStats(@Param("regionId") regionId: string) {
    const publicStats: PublicStats = {
      courrierOutCount: 0,
      usagersCount: 0,
      usersCount: 0,
      structuresCount: 0,
      interactionsCount: 0,
    };

    // Si aucune region
    let structures = null;

    if (regionId) {
      structures = await this.structuresService.findStructuresInRegion(
        regionId
      );

      publicStats.structuresCountByDepartement =
        await this.dashboardService.getStructuresCountByDepartement(regionId);

      publicStats.structuresCount = structures.length;
    } else {
      publicStats.structuresCount =
        await this.dashboardService.countStructures();

      publicStats.structuresCountByRegion =
        await this.dashboardService.getStructuresCountByRegion();
    }

    // Usagers
    const usagers = await usagerRepository.countUsagers(structures);
    const ayantsDroits = await usagerRepository.countAyantsDroits(structures);

    publicStats.usagersCount = usagers + ayantsDroits;

    publicStats.usersCount = await this.dashboardService.countUsers(structures);

    publicStats.interactionsCount =
      await this.dashboardService.totalInteractions("courrierOut", structures);

    publicStats.structuresCountByTypeMap =
      await this.dashboardService.getStructuresCountByTypeMap(regionId);

    publicStats.interactionsCountByMonth =
      await this.dashboardService.countInteractionsByMonth(regionId);

    publicStats.usagersCountByMonth =
      await this.dashboardService.countUsagersByMonth(regionId);

    return publicStats;
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
