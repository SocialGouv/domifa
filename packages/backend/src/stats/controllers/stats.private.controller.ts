import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
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
import { authChecker } from "../../auth/services/auth-checker.service";
import { structureStatsExporter } from "../../excel/export-structure-stats";
import { expressResponseExcelRenderer } from "../../util";
import {
  StructureStatsFull,
  UserStructureAuthenticated,
} from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { structureStatsInPeriodGenerator } from "../services";
import { statsQuestionsCoreBuilder } from "../services/statsQuestionsCoreBuilder.service";

import moment = require("moment");

@Controller("stats")
@ApiTags("stats")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class StatsPrivateController {
  public sheet: {
    [key: string]: {};
  }[];

  constructor() {
    this.sheet = [];
  }

  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("")
  public async getByDate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() statsDto: StatsDto
  ) {
    if (
      statsDto.structureId !== user.structureId &&
      !authChecker.isDomifaAdmin(user)
    ) {
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }
    return this.buildStatsInPeriod({
      ...statsDto,
      structureId: statsDto.structureId,
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
    if (
      statsDto.structureId !== user.structureId &&
      user._userProfile !== "super-admin-domifa"
    ) {
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
