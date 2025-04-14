import {
  StructureStatsReportingQuestions,
  StructureStatsFull,
} from "@domifa/common";
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
import { addDays } from "date-fns";
import { Response } from "express";
import { format } from "date-fns";
import {
  UserStructureAuthenticated,
  UserAdminAuthenticated,
} from "../../../_common/model";
import { USER_SUPERVISOR_ROLES } from "../../../_common/model/users/user-supervisor";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUser,
  AllowUserSupervisorRoles,
} from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import {
  structureStatsReportingQuestionsRepository,
  StructureStatsReportingQuestionsTable,
} from "../../../database";
import { structureStatsExporter } from "../../../excel/export-structure-stats";
import { expressResponseExcelRenderer } from "../../../util";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { StructureStatsReportingDto, StatsDto } from "../dto";
import {
  statsQuestionsCoreBuilder,
  structureStatsInPeriodGenerator,
} from "../services";

@Controller("stats")
@ApiTags("stats")
@AllowUserProfiles("structure")
@AllowUserStructureRoles("simple", "responsable", "admin")
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

    const questionsToAdd: StructureStatsReportingQuestions = {
      ...reportingDto,
      completedBy: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
      },
      structureId: user.structureId,
      confirmationDate: new Date(),
    };

    if (!stats) {
      await structureStatsReportingQuestionsRepository.save(
        new StructureStatsReportingQuestionsTable(questionsToAdd)
      );
    } else {
      await structureStatsReportingQuestionsRepository.update(
        {
          structureId: user.structureId,
          year: reportingDto.year,
        },
        questionsToAdd
      );
    }
    return;
  }

  @Get("reporting-questions")
  public async getReportingQuestions(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const stats = await structureStatsReportingQuestionsRepository.find({
      where: {
        structureId: user.structureId,
      },
      order: {
        year: "ASC",
      },
    });
    return stats;
  }

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

  @AllowUserProfiles("structure")
  @Post("export")
  public async exportByDate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() statsDto: StatsDto,
    @Res() res: Response
  ): Promise<void> {
    await this.appLogsService.create({
      userId: user.id,
      structureId: user?.structureId ?? 1,
      action: "EXPORT_STATS",
    });

    const stats = await this.buildStatsInPeriod({
      structureId: user.structureId,
      ...statsDto,
    });

    const workbook = await structureStatsExporter.generateExcelDocument({
      exportDate: new Date(),
      stats,
    });

    const fileName = buildExportStructureStatsFileName({
      startDateUTC: stats.period.startDateUTC,
      endDateUTCExclusive: stats.period.endDateUTCExclusive,
    });

    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });
  }

  @AllowUserProfiles("supervisor")
  @AllowUserSupervisorRoles(...USER_SUPERVISOR_ROLES)
  @Post("export-from-admin")
  public async exportFromAdminByDate(
    @CurrentUser() userLogged: UserAdminAuthenticated,
    @Body() statsDto: StatsDto,
    @Res() res: Response
  ): Promise<void> {
    await this.appLogsService.create({
      userId: userLogged.id,
      structureId: 1,
      action: "EXPORT_STATS_FROM_ADMIN",
    });

    const structureId = statsDto.structureId;

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
    return await structureStatsInPeriodGenerator.buildStatsInPeriod({
      structureId,
      startDateUTC,
      endDateUTCExclusive,
    });
  }
}

export function buildExportStructureStatsFileName({
  startDateUTC,
  endDateUTCExclusive,
}: {
  startDateUTC: Date;
  endDateUTCExclusive: Date;
}) {
  return `${format(startDateUTC, "yyyy-MM-dd")}_${format(
    endDateUTCExclusive,
    "yyyy-MM-dd"
  )}_export-structure_stats.xlsx`;
}
