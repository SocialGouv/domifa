import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DomifaGuard } from "../../auth/guards/domifa.guard";
import { InteractionsService } from "../../interactions/interactions.service";
import { StructuresService } from "../../structures/structures.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { DashboardService } from "../services/dashboard.service";
import { StatsGeneratorService } from "../services/stats-generator.service";

@UseGuards(AuthGuard("jwt"))
@UseGuards(DomifaGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly statsGeneratorService: StatsGeneratorService
  ) {}

  // 1. Liste des structures
  @Get("structures")
  public async structures() {
    return this.dashboardService.getStructures();
  }

  // 2. Liste des structures par type
  @Get("structures/type")
  public async countByType() {
    const structures: { [key: string]: any } = {};
    const result = await this.dashboardService.getStructuresByType();
    for (const structure of result) {
      structures[structure.structureType] = structure.count;
    }
    return structures;
  }

  // 3. Les interactions
  @Get("interactions")
  public async getInteractions() {
    return this.dashboardService.getInteractions();
  }

  // 4. Total des users
  @Get("users")
  public async getUsers() {
    return this.dashboardService.getUsers();
  }

  // 5. Total des domiciliés actifs
  @Get("usagers/valide")
  public async getUsagersActifs() {
    const result = await this.dashboardService.getUsagersValide();
    const usagers: { [key: string]: any } = {};

    for (const usager of result) {
      usagers[usager.structureId] = usager.count;
    }
    return usagers;
  }

  @Get("docs")
  public async getDocs() {
    const docs = await this.statsGeneratorService.countDocs();
    return docs[0].count;
  }

  @Get("usagers")
  public async getUsagers() {
    const ayantsDroits = await this.statsGeneratorService.countAyantsDroits();
    const result = await this.dashboardService.getUsagers();

    const usagers: { [key: string]: any } = {};
    let total = 0;

    usagers.AYANTS_DROITS = ayantsDroits[0].count;
    for (const usager of result) {
      usagers[usager._id.statut] = usager.sum[0];
      total += usager.sum[0];
    }
    usagers.TOUS = total + usagers.AYANTS_DROITS;
    return usagers;
  }

  @Get("structures/regions")
  public async getRegions() {
    return this.dashboardService.getRegions();
  }
}
