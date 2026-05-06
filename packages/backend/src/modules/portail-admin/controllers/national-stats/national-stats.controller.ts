import { Structure } from "@domifa/common";
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
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";
import { FindOptionsWhere, In } from "typeorm";

import { UserAdminAuthenticated } from "../../../../_common/model";
import { USER_SUPERVISOR_ROLES } from "../../../../_common/model/users/user-supervisor";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { structureRepository } from "../../../../database";
import { structureStatsExporter } from "../../../../excel/export-structure-stats";
import { expressResponseExcelRenderer } from "../../../../util";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import { buildExportStructureStatsFileName } from "../../../stats/controllers/stats.private.controller";
import { StatsDto } from "../../../stats/dto";
import { structureStatsInPeriodGenerator } from "../../../stats/services";
import { MetabaseStatsDto } from "../../dto/MetabaseStats.dto";
import { resolveTerritoryFilter } from "../../services";
import { getOrCreateMetabaseEmbedUrl } from "./metabase-embed.helper";

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
    if (!statsDto?.structureId) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    const structure = await structureRepository.findOneBy({
      id: statsDto.structureId,
    });

    if (!structure) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    await this.appLogsService.create({
      ...buildSupervisorActorFields(userLogged),
      structureId: statsDto.structureId,
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

  @Throttle({
    short: { limit: 5, ttl: 1_000, blockDuration: 300_000 },
    medium: { limit: 30, ttl: 60_000, blockDuration: 900_000 },
    long: { limit: 300, ttl: 3_600_000, blockDuration: 3_600_000 },
  })
  @Post("metabase-stats")
  public async getMetabaseStats(
    @CurrentUser() user: UserAdminAuthenticated,
    @Body() metabaseDto: MetabaseStatsDto,
    @Res() res: Response
  ) {
    const filter = resolveTerritoryFilter(user, metabaseDto);
    if (!filter) {
      await this.appLogsService.create({
        ...buildSupervisorActorFields(user),
        action: "GET_STATS_PORTAIL_ADMIN_DENIED",
      });
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "BAD_REQUEST" });
    }

    if (metabaseDto.structureId) {
      const structureAllowed = await this.isStructureAccessible(
        user,
        metabaseDto.structureId,
        filter
      );
      if (!structureAllowed) {
        await this.appLogsService.create({
          ...buildSupervisorActorFields(user),
          action: "GET_STATS_PORTAIL_ADMIN_DENIED",
        });
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "BAD_REQUEST" });
      }
    }

    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      structureId: metabaseDto.structureId ?? undefined,
      action: "GET_STATS_PORTAIL_ADMIN",
    });

    const url = getOrCreateMetabaseEmbedUrl(user, filter, metabaseDto);
    return res.status(HttpStatus.OK).json({ url });
  }

  @Post("metabase-get-structures")
  public async getStructures(
    @CurrentUser() user: UserAdminAuthenticated,
    @Body() metabaseDto: MetabaseStatsDto
  ): Promise<Array<Partial<Structure>>> {
    const filter = resolveTerritoryFilter(user, metabaseDto);
    if (!filter) {
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }

    const params: FindOptionsWhere<Structure> = {
      structureType: metabaseDto?.structureType ?? undefined,
      statut: "VALIDE",
    };

    if (filter.department.length === 1) {
      params.departement = filter.department[0];
    } else if (filter.department.length > 1) {
      params.departement = In(filter.department);
    } else if (filter.region.length === 1) {
      params.region = filter.region[0];
    } else if (filter.region.length > 1) {
      params.region = In(filter.region);
    }

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

  private async isStructureAccessible(
    user: UserAdminAuthenticated,
    structureId: number,
    filter: { region: string[]; department: string[] }
  ): Promise<boolean> {
    const id = Number(structureId);
    if (!Number.isInteger(id) || id <= 0) return false;

    const structure = await structureRepository.findOne({
      where: { id },
      select: ["id", "region", "departement"],
    });
    if (!structure) return false;

    if (user.role === "national" || user.role === "super-admin-domifa") {
      return true;
    }

    if (filter.department.length > 0) {
      return filter.department.includes(structure.departement);
    }
    if (filter.region.length > 0) {
      return filter.region.includes(structure.region);
    }
    return false;
  }
}
