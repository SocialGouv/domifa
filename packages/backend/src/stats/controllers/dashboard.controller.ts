import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { DomifaGuard } from "../../auth/guards/domifa.guard";
import {
  structureRepository,
  userStructureRepository,
  UserStructureTable,
} from "../../database";
import {
  statsDeploiementExporter,
  StatsDeploiementExportModel,
} from "../../excel/export-stats-deploiement";
import { StatsExportUser } from "../../excel/export-stats-deploiement/StatsExportUser.type";
import { expressResponseExcelRenderer } from "../../util";
import { dataCompare } from "../../util/dataCompare.service";
import { DashboardStats, Structure } from "../../_common/model";
import { DashboardService } from "../services/dashboard.service";
import moment = require("moment");

@UseGuards(AuthGuard("jwt"), DomifaGuard)
@Controller("dashboard")
@ApiTags("dashboard")
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("export")
  public async export(@Res() res: Response) {
    const stats: StatsDeploiementExportModel =
      await this.dashboardService.getStatsDeploiement();

    const USER_STATS_ATTRIBUTES: (keyof StatsExportUser &
      keyof UserStructureTable)[] = [
      "id",
      "email",
      "nom",
      "prenom",
      "role",
      "verified",
      "structureId",
    ];
    const users = await userStructureRepository.findMany<
      Omit<StatsExportUser, "structure">
    >(undefined, {
      select: USER_STATS_ATTRIBUTES,
    });

    const structures: Pick<Structure, "id" | "nom">[] =
      await structureRepository.findMany({}, { select: ["id", "nom"] });

    const structuresById = structures.reduce((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {} as { [attr: string]: Pick<Structure, "id" | "nom"> });

    const usersWithStructure: StatsExportUser[] = users.map((u) => ({
      ...u,
      structure: structuresById[u.structureId],
    }));

    usersWithStructure.sort((a, b) => {
      const res = dataCompare.compareAttributes(a.nom, b.nom, {
        asc: true,
        nullFirst: false,
      });
      if (res === 0) {
        return dataCompare.compareAttributes(a.prenom, b.prenom, {
          asc: true,
          nullFirst: false,
        });
      }
      return res;
    });

    const workbook = await statsDeploiementExporter.generateExcelDocument({
      stats,
      users: usersWithStructure,
    });

    const fileName = `${moment(stats.exportDate).format(
      "DD-MM-yyyy_HH-mm"
    )}_export-stats-deploiement.xlsx`;
    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });
  }

  @Get()
  public async dashboardStats(): Promise<DashboardStats> {
    const stats = await this.dashboardService.getStatsDomifaAdminDashboard();
    return stats;
  }
}
