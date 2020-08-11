import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { regions } from "../../structures/regions.labels";
import { DomifaGuard } from "../../auth/guards/domifa.guard";

import { InteractionsService } from "../../interactions/interactions.service";
import { StructuresService } from "../../structures/structures.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { StatsGeneratorService } from "../services/stats-generator.service";
import { DashboardService } from "../services/dashboard.service";
import { DashboardDto } from "../dto/dashboard.dto";

@UseGuards(AuthGuard("jwt"))
@UseGuards(DomifaGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly statsService: StatsGeneratorService,
    private readonly dashboardService: DashboardService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}

  // 1. Liste des structures
  @Get("structures")
  public async structures(@Query() query: DashboardDto) {
    return this.dashboardService.getStructures(query);
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

  @Get("usagers")
  public async getUsagers() {
    const result = await this.dashboardService.getUsagers();
    const usagers: { [key: string]: any } = {};
    let total = 0;
    for (const usager of result) {
      usagers[usager._id.statut] = usager.sum[0];
      total += usager.sum[0];
    }
    usagers.TOUS = total;
    return usagers;
  }

  @Get("structures/regions")
  public async getRegions() {
    return this.dashboardService.getRegions();
  }
}
