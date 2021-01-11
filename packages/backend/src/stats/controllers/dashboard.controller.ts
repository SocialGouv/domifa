import { Controller, Get, Inject, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Model } from "mongoose";
import { DomifaGuard } from "../../auth/guards/domifa.guard";
import { AppUserTable, usersRepository } from "../../database";
import {
  statsDeploiementExporter,
  StatsDeploiementExportModel,
} from "../../excel/export-stats-deploiement";
import { StatsExportUser } from "../../excel/export-stats-deploiement/StatsExportUser.type";
import { Structure } from "../../structures/structure-interface";
import { appLogger } from "../../util";
import { dataCompare } from "../../util/dataCompare.service";
import { DashboardService } from "../services/dashboard.service";
import moment = require("moment");

@UseGuards(AuthGuard("jwt"), DomifaGuard)
@Controller("dashboard")
@ApiTags("dashboard")
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @Inject("STRUCTURE_MODEL") private structureModel: Model<Structure>
  ) {}

  @Get("export")
  public async export(@Res() res: Response) {
    const stats: StatsDeploiementExportModel = await this.dashboardService.getStatsDeploiement();

    const USER_STATS_ATTRIBUTES: (keyof StatsExportUser &
      keyof AppUserTable)[] = [
      "id",
      "email",
      "nom",
      "prenom",
      "role",
      "verified",
      "structureId",
    ];
    const users = await usersRepository.findMany<
      Omit<StatsExportUser, "structure">
    >(undefined, {
      select: USER_STATS_ATTRIBUTES,
    });

    const structures: Pick<
      Structure,
      "id" | "nom"
    >[] = await this.structureModel.find().select(["id", "nom"]).lean();

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
    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.header("Content-Disposition", `attachment; filename="${fileName}"`);

    await workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        appLogger.error("Unexpected export error", err);
        res.sendStatus(500);
        res.end();
      });
  }

  // 1. Liste des structures
  @Get("structures")
  public async structures() {
    return this.dashboardService.getStructuresForDashboard();
  }

  // 2. Liste des structures par type
  @Get("structures/type")
  public async countByType() {
    return this.dashboardService.getStructuresCountByType();
  }

  // 3. Les interactions
  @Get("interactions")
  public async getInteractions() {
    return this.dashboardService.getInteractionsCountByType();
  }

  // 4. Total des users
  @Get("users")
  public async getUsers() {
    return usersRepository.count();
  }

  // 5. Total des domiciliés actifs
  @Get("usagers/valide")
  public async getUsagersActifs() {
    return this.dashboardService.getUsagersCountByStructureId();
  }

  @Get("usagers/langues")
  public async getLanguages() {
    const langues = await this.dashboardService.getLanguages();

    const statsLangues = [];
    for (const langue of langues) {
      const label =
        langue._id.langue !== null && langue._id.langue !== ""
          ? langue._id.langue
          : "NON_RENSEIGNE";
      statsLangues.push({
        label,
        total: langue.sum[0],
      });
    }
    return statsLangues;
  }

  @Get("docs")
  public async getDocs() {
    return this.dashboardService.getDocsCount();
  }

  @Get("usagers")
  public async getUsagers() {
    return this.dashboardService.getUsagersCountByStatut();
  }

  @Get("structures/regions")
  public async getRegions() {
    return this.dashboardService.getRegions();
  }
}
