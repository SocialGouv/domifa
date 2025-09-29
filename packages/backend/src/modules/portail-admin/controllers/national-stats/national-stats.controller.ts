import { REGIONS_LISTE, DEPARTEMENTS_MAP, Structure } from "@domifa/common";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FindOptionsWhere } from "typeorm";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { USER_SUPERVISOR_ROLES } from "../../../../_common/model/users/user-supervisor";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentUser,
} from "../../../../auth/decorators";
import { domifaConfig } from "../../../../config";
import { structureRepository } from "../../../../database";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { MetabaseStatsDto } from "../../dto/MetabaseStats.dto";
import { sign } from "jsonwebtoken";
import { AuthGuard } from "@nestjs/passport";
import { AppUserGuard } from "../../../../auth/guards";
import { checkTerritories } from "../../services";
import { Response } from "express";
import { structureStatsInPeriodGenerator } from "../../../stats/services";
import { structureStatsExporter } from "../../../../excel/export-structure-stats";
import { expressResponseExcelRenderer } from "../../../../util";
import { buildExportStructureStatsFileName } from "../../../stats/controllers/stats.private.controller";
import { StatsDto } from "../../../stats/dto";

@Controller("admin/national-stats")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles(...USER_SUPERVISOR_ROLES)
export class NationalStatsController {
  constructor(private readonly appLogsService: AppLogsService) {}

  @Post("export-structure-stats")
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

    const stats = await structureStatsInPeriodGenerator.buildStatsInPeriod(
      statsDto
    );

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

  @Post("metabase-stats")
  public async getMetabaseStats(
    @CurrentUser() user: UserAdminAuthenticated,
    @Body() metabaseDto: MetabaseStatsDto,
    @Res() res: Response
  ) {
    await this.appLogsService.create({
      userId: user.id,
      action: "GET_STATS_PORTAIL_ADMIN",
    });

    const METABASE_URL = domifaConfig().metabase.url;

    if (!checkTerritories(user, metabaseDto)) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "USER_NOT_FOUND" });
    }

    const year = metabaseDto.year ? [metabaseDto.year] : [];
    let region = metabaseDto.region ? [REGIONS_LISTE[metabaseDto.region]] : [];
    let department = metabaseDto.department
      ? [DEPARTEMENTS_MAP[metabaseDto.department].departmentName]
      : [];
    const structureId = metabaseDto.structureId
      ? [metabaseDto.structureId]
      : [];
    const structureType = metabaseDto.structureType
      ? [metabaseDto.structureType]
      : [];

    if (department.length > 0) {
      region = [];
    }

    if (region.length > 0) {
      department = [];
    }

    const payload = {
      resource: { dashboard: 6 },
      params: {
        "ann%C3%A9e_du_rapport": year,
        "r%C3%A9gion": region,
        "d%C3%A9partement": department,
        type_de_structure: structureType,
        structureid: structureId,
      },
      exp: Math.round(Date.now() / 1000) + 100 * 60,
    };

    const token = sign(payload, domifaConfig().metabase.token);
    const url = `${METABASE_URL}embed/dashboard/${token}#bordered=false&titled=false`;
    return res.status(HttpStatus.OK).json({ url });
  }

  @Post("metabase-get-structures")
  public async getStructures(
    @Body() metabaseDto: MetabaseStatsDto
  ): Promise<Array<Partial<Structure>>> {
    const params: FindOptionsWhere<Structure> = {
      region:
        !metabaseDto?.department && metabaseDto?.region
          ? metabaseDto?.region
          : undefined,
      departement: metabaseDto?.department ?? undefined,
      structureType: metabaseDto?.structureType ?? undefined,
      statut: "VALIDE",
    };

    return await structureRepository.find({
      where: params,
      select: ["id", "nom", "ville", "codePostal"],
      order: {
        codePostal: "ASC",
        ville: "ASC",
        nom: "ASC",
      },
    });
  }

  @Get("last-update")
  public async getLastUpdate(): Promise<Date | null> {
    const lastUsager = await structureRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    });
    return lastUsager?.createdAt ?? null;
  }
}
