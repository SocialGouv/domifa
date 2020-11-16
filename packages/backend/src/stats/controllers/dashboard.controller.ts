import { Controller, Get, Inject, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Model } from "mongoose";
import { DomifaGuard } from "../../auth/guards/domifa.guard";
import {
  statsDeploiementExporter,
  StatsDeploiementExportModel
} from "../../excel/export-stats-deploiement";
import { StatsExportUser } from "../../excel/export-stats-deploiement/StatsExportUser.type";
import { User } from "../../users/user.interface";
import { appLogger } from "../../util";
import { mongoSelectAttributes } from "../../util/mongoSelectAttributes.fn";
import { DashboardService } from "../services/dashboard.service";
import moment = require("moment");

@UseGuards(AuthGuard("jwt"), DomifaGuard)
@Controller("dashboard")
@ApiTags("dashboard")
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @Inject("USER_MODEL") private readonly userModel: Model<User>
  ) { }

  @Get("export")
  public async export(@Res() res: Response) {
    const stats: StatsDeploiementExportModel = await this.dashboardService.getStatsDeploiement();

    const USER_STATS_ATTRIBUTES = mongoSelectAttributes<StatsExportUser>(
      "id",
      "email",
      "nom",
      "prenom",
      "role",
      "verified"
    );
    const users = ((await this.userModel
      .find({})
      .populate({
        path: "structure",
        select: "id nom",
        model: "Structure",
      })
      .select(USER_STATS_ATTRIBUTES)
      .sort({
        nom: 1,
        prenom: 1,
      })
      .exec()) as unknown) as StatsExportUser[];

    const workbook = await statsDeploiementExporter.generateExcelDocument({
      stats,
      users,
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
