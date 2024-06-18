import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../auth/decorators";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { structureStatsExporter } from "../../excel/export-structure-stats";
import { expressResponseExcelRenderer } from "../../util";
import { UserStructureAuthenticated } from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { structureStatsInPeriodGenerator } from "../services";
import { statsQuestionsCoreBuilder } from "../services/statsQuestionsCoreBuilder.service";

import { addDays, format } from "date-fns";
import { StructureStatsFull } from "@domifa/common";
import { StructureStatsReportingDto } from "../dto";
import { structureStatsReportingQuestionsRepository } from "../../database";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

@Controller("stats")
@ApiTags("stats")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class StatsPrivateController {
  constructor(private readonly appLogsService: AppLogsService) {}

  // Update reporting
  @AllowUserStructureRoles("responsable", "admin")
  @Patch("reporting-questions")
  public async setReportingQuestions(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() reportingDto: StructureStatsReportingDto
  ): Promise<void> {
    const stats = await structureStatsReportingQuestionsRepository.findOne({
      where: {
        structureId: user.structureId,
        year: reportingDto.year,
      },
    });

    if (!stats) {
      throw new Error("CANNOT_UPDATE_REPORT");
    }

    await structureStatsReportingQuestionsRepository.update(
      {
        structureId: user.structureId,
        year: reportingDto.year,
      },
      {
        waitingList: reportingDto.waitingList,
        waitingTime: reportingDto.waitingTime,
        workers: reportingDto.workers,
        volunteers: reportingDto.volunteers,
        humanCosts: reportingDto.humanCosts,
        totalCosts: reportingDto.totalCosts,
        completedBy: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
        },
        confirmationDate: new Date(),
      }
    );
  }

  // Get reporting
  @AllowUserStructureRoles("responsable", "admin", "simple")
  @Get("reporting-questions")
  public async getReportingQuestions(
    @CurrentUser() _user: UserStructureAuthenticated
  ) {
    const stats = await structureStatsReportingQuestionsRepository.find({
      where: {
        structureId: _user.structureId,
      },
      order: {
        year: "ASC",
      },
    });
    return stats;
  }

  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("")
  public async getByDate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() statsDto: StatsDto
  ) {
    await this.appLogsService.create({
      userId: user.id,
      structureId: user.structureId,
      action: "GET_STATS",
    });
    return this.buildStatsInPeriod({
      ...statsDto,
      structureId: user.structureId,
    });
  }

  @AllowUserProfiles("super-admin-domifa", "structure")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("export")
  public async exportByDate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() statsDto: StatsDto,
    @Res() res: Response
  ) {
    await this.appLogsService.create({
      userId: user.id,
      structureId: user.structureId,
      action: "EXPORT_STATS",
    });

    const structureId =
      user._userProfile === "super-admin-domifa"
        ? statsDto.structureId
        : user.structureId;

    const stats = await this.buildStatsInPeriod({
      structureId,
      ...statsDto,
    });

    const workbook = await structureStatsExporter.generateExcelDocument({
      exportDate: new Date(),
      stats,
    });
    const fileName = buildExportStructureStatsFileName({
      startDateUTC: stats.period.startDateUTC,
      endDateUTCExclusive: stats.period.endDateUTCExclusive,
      structureId: user.structureId,
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
      new Date(start)
    );
    const endDateUTCExclusive = statsQuestionsCoreBuilder.removeUTCHours(
      addDays(new Date(end), 1)
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
  return `${format(startDateUTC, "yyyy-MM-dd")}_${format(
    endDateUTCExclusive,
    "yyyy-MM-dd"
  )}_export-structure-${structureId}-stats.xlsx`;
}
