import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { DomifaGuard } from "../../auth/guards/domifa.guard";
import {
  statsDeploiementExporter,
  StatsDeploiementExportModel,
} from "../../excel/export-stats-deploiement";
import { appLogger } from "../../util";
import { DashboardService } from "../services/dashboard.service";
import { StatsGeneratorService } from "../services/stats-generator.service";
import moment = require("moment");

@UseGuards(AuthGuard("jwt"), DomifaGuard)
@Controller("dashboard")
@ApiTags("dashboard")
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly statsGeneratorService: StatsGeneratorService
  ) {}

  @Get("export")
  public async export(@Res() res: Response) {
    const model: StatsDeploiementExportModel = await this.dashboardService.getStatsDeploiement();
    const workbook = await statsDeploiementExporter.generateExcelDocument(
      model
    );

    const fileName = `${moment(model.exportDate).format(
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
    return this.dashboardService.getStructures();
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
    return this.dashboardService.getUsers();
  }

  // 5. Total des domiciliés actifs
  @Get("usagers/valide")
  public async getUsagersActifs() {
    return this.dashboardService.getUsagersCountByStructureId();
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
