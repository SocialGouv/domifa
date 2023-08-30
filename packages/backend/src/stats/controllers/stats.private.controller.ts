import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
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
import {
  StructureStatsFull,
  UserStructureAuthenticated,
} from "../../_common/model";
import { StatsDto } from "../dto/stats.dto";
import { structureStatsInPeriodGenerator } from "../services";
import { statsQuestionsCoreBuilder } from "../services/statsQuestionsCoreBuilder.service";

import { addDays, format } from "date-fns";

@Controller("stats")
@ApiTags("stats")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class StatsPrivateController {
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("")
  public async getByDate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() statsDto: StatsDto
  ) {
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
